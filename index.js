// Load up the discord.js library
const Discord = require("discord.js");

// This is your client. Some people call it `bot`, some people call it `self`, 
// some might call it `cootchie`. Either way, when you see `client.something`, or `bot.something`,
// this is what we're refering to. Your client.
const client = new Discord.Client();

// Here we load the config.json file that contains our token and our prefix values. 
const config = require("./config.json");
// config.token contains the bot's token
// config.prefix contains the message prefix.

client.on("ready", () => {
  // This event will run if the bot starts, and logs in, successfully.
  console.log(`Mainframe Booting... Online! Bootup Successful`); 
  // Example of changing the bot's playing game to something useful. `client.user` is what the
  // docs refer to as the "ClientUser".
  client.user.setActivity(`Mainframe Online!`);
  client.user.setStatus('online');
  
});

client.on("guildCreate", guild => {
  // This event triggers when the bot joins a guild.
  console.log(`New guild joined: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount} members!`);
});

client.on("guildDelete", guild => {
  // this event triggers when the bot is removed from a guild.
  console.log(`I have been removed from: ${guild.name} (id: ${guild.id})`);
});


client.on("message", async message => {
  // This event will run on every single message received, from any channel or DM.
  
  // It's good practice to ignore other bots. This also makes your bot ignore itself
  // and not get into a spam loop (we call that "botception").
  if(message.author.bot) return;
  
  // Also good practice to ignore any message that does not start with our prefix, 
  // which is set in the configuration file.
  if(message.content.indexOf(config.prefix) !== 0) return;
  
  // Here we separate our "command" name, and our "arguments" for the command. 
  // e.g. if we have the message "+say Is this the real life?" , we'll get the following:
  // command = say
  // args = ["Is", "this", "the", "real", "life?"]
  const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();
  
  // Let's go with a few common example commands! Feel free to delete or change those.
  
  if(command === "ping") {
    // Calculates ping between sending a message and editing it, giving a nice round-trip latency.
    // The second ping is an average latency between the bot and the websocket server (one-way, not round-trip)
    const m = await message.channel.send("Ping?");
    m.edit(`Pong! Latency is ${m.createdTimestamp - message.createdTimestamp}ms. API Latency is ${Math.round(client.ping)}ms`);
  }
  
  if(command === "say") {
    // makes the bot say something and delete the message. As an example, it's open to anyone to use. 
    // To get the "message" itself we join the `args` back into a string with spaces: 
    if(!message.member.roles.some(r=>["Mainframe Operator"].includes(r.name)) )
    return message.reply("Sorry, you are not a Mainframe Operator!");
    
    const sayMessage = args.join(" ");
    // Then we delete the command message (sneaky, right?). The catch just ignores the error with a cute smiley thing.
    message.delete().catch(O_o=>{}); 
    // And we get the bot to say the thing: 
    message.channel.send(sayMessage);
  }
  
  if(command === "kick") {
    // This command must be limited to mods and admins. In this example we just hardcode the role names.
    // Please read on Array.some() to understand this bit: 
    // https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Array/some?
    if(!message.member.roles.some(r=>["Mainframe Operator"].includes(r.name)) )
      return message.reply("Sorry, you are not a Mainframe Operator!");
    
    // Let's first check if we have a member and if we can kick them!
    // message.mentions.members is a collection of people that have been mentioned, as GuildMembers.
    // We can also support getting the member by ID, which would be args[0]
    let member = message.mentions.members.first() || message.guild.members.get(args[0]);
    if(!member)
      return message.reply("Please mention a valid member of this server");
    if(!member.kickable) 
      return message.reply("I cannot kick this user! Do they have a higher role? Do I have kick permissions?");
    
    // slice(1) removes the first part, which here should be the user mention or ID
    // join(' ') takes all the various parts to make it a single string.
    let reason = args.slice(1).join(' ');
    if(!reason) reason = "No reason provided";
    
    // Now, time for a swift kick in the nuts!
    await member.kick(reason)
      .catch(error => message.reply(`Sorry ${message.author} I couldn't kick because of : ${error}`));
    message.reply(`${member.user.tag} has been kicked by ${message.author.tag} because: ${reason}`);

  }
  
  if(command === "ban") {
    // Most of this command is identical to kick, except that here we'll only let admins do it.
    // In the real world mods could ban too, but this is just an example, right? ;)
    if(!message.member.roles.some(r=>["Mainframe Operator"].includes(r.name)) )
      return message.reply("Sorry, you are not a Mainframe Operator!");
    
    let member = message.mentions.members.first();
    if(!member)
      return message.reply("Please mention a valid member of this server");
    if(!member.bannable) 
      return message.reply("I cannot ban this user! Do they have a higher role? Do I have ban permissions?");

    let reason = args.slice(1).join(' ');
    if(!reason) reason = "No reason provided";
    
    await member.ban(reason)
      .catch(error => message.reply(`Sorry ${message.author} I couldn't ban because of : ${error}`));
    message.reply(`${member.user.tag} has been banned by ${message.author.tag} because: ${reason}`);
  }
  
  if(command === "purge") {
    // This command removes all messages from all users in the channel, up to 100.
    
    if(!message.member.roles.some(r=>["Mainframe Operator"].includes(r.name)) )
      return message.reply("Sorry, you are not a Mainframe Operator!");
    // get the delete count, as an actual number.
    const deleteCount = parseInt(args[0], 10);
    
    // Ooooh nice, combined conditions. <3
    if(!deleteCount || deleteCount < 2 || deleteCount > 100)
      return message.reply("Please provide a number between 2 and 100 for the number of messages to delete");
    
    // So we get our messages, and delete them. Simple enough, right?
    const fetched = await message.channel.fetchMessages({limit: deleteCount});
    message.channel.bulkDelete(fetched)
      .catch(error => message.reply(`Couldn't delete messages because of: ${error}`));
  }
  
  if (command === "shutdown") {
    if(!message.member.roles.some(r=>["Mainframe Operator"].includes(r.name)) )
      return message.reply("Sorry, you are not a Mainframe Operator!");
    client.user.setActivity(`Mainframe Offline`)
    client.user.setStatus("invisible")
    var shutdown = new Discord.RichEmbed()
        .addField("Status", "Mainframe Pre-Shutoff Operations... Complete\nMainframe Sub Modules shutting down... Complete\nMainframe Shutting Down... Goodbye")
        .setColor("#d10000")    
        .setAuthor("J.A.R.V.I.S", client.user.avatarURL)  
        .setFooter("J.A.R.V.I.S")
        .setTimestamp()
        client.channels.get("587109562310721537").send(shutdown).then(() => {
          process.exit(1);
        })
  };

  if(command === "dev") {
    if(!message.member.roles.some(r=>["Mainframe Operator"].includes(r.name)) )
      return message.reply("Sorry, you are not a Mainframe Operator!");
    client.user.setActivity(`Development Mode`)
    client.user.setStatus('dnd');
    message.channel.send("Enabling Developer Mode")
  }

  if(command === "online") {
    if(!message.member.roles.some(r=>["Mainframe Operator"].includes(r.name)) )
      return message.reply("Sorry, you are not a Mainframe Operator!");
    client.user.setActivity(`Mainframe Online!`)
    client.user.setStatus('online')
  }

  if(command === "idle") {
    if(!message.member.roles.some(r=>["Mainframe Operator"].includes(r.name)) )
      return message.reply("Sorry, you are not a Mainframe Operator!");
    client.user.setActivity(`Mainframe Idle`)
    client.user.setStatus('idle')
    message.channel.send("Mainframe Usage Low Enabling Idle Mode")
  }

  if(command === "update") {
    if(!message.member.roles.some(r=>["Mainframe Operator"].includes(r.name)) )
      return message.reply("Sorry, you are not a Mainframe Operator!");
    const sayMessage = args.join(" ");
    var update = new Discord.RichEmbed()
    .addField("Update", sayMessage)
    .setColor("#fca103")
    .setAuthor("J.A.R.V.I.S", client.user.avatarURL)
    .setFooter("J.A.R.V.I.S")
    .setTimestamp()
  client.channels.get("587108925757980713").send(update)
  }
  
  if(command === "warning") {
    if(!message.member.roles.some(r=>["Mainframe Operator"].includes(r.name)) )
      return message.reply("Sorry, you are not a Mainframe Operator!");
    const sayMessage = args.join(" ");
    var warning = new Discord.RichEmbed()
    .addField("Warning", sayMessage)
    .setColor("#d10000")
    .setAuthor("J.A.R.V.I.S", client.user.avatarURL)
    .setFooter("J.A.R.V.I.S")
    .setTimestamp()
  client.channels.get("587108799660294154").send(warning)
  }

  if(command === "error") {
    if(!message.member.roles.some(r=>["Mainframe Operator"].includes(r.name)) )
      return message.reply("Sorry, you are not a Mainframe Operator!");
    const sayMessage = args.join(" ");
    var error = new Discord.RichEmbed()
    .addField("ERROR", sayMessage)
    .setColor("#fc0303")
    .setAuthor("j.$.R.£.i.s", client.user.avatarURL)
    .setFooter("j.$.R.£.i.s")
    .setTimestamp()
  client.channels.get("587108799660294154").send(error)
  }

  if(command === "announce") {
    if(!message.member.roles.some(r=>["Mainframe Operator"].includes(r.name)) )
      return message.reply("Sorry, you are not a Mainframe Operator!");
    const sayMessage = args.join(" ");
    var mainframe = new Discord.RichEmbed()
    .addField("Announcement", sayMessage)
    .setColor("#03fc03")
    .setAuthor("J.A.R.V.I.S", client.user.avatarURL)
    .setFooter("J.A.R.V.I.S")
    .setTimestamp()
  client.channels.get("587108799660294154").send(mainframe)
  }

  if(command === "commands") {
    message.channel.send("__The Current Commands are:__\n-connect = Gives you the connect link!\n-ping = Pings the bot and calculates Delay\n-say (message) = The Bot deletes your message and sends What you want it to say\n-kick (@member) (reason) = Kicks the selected member from the server\n-ban (@member) (reason) = Bans the selected member from the server\n-purge (2-100) = Deletes Said amount of messages from the current channel\n-shutdown = Shuts down the bot remotely\n-dev = enables developer mode\n-idle = enables idle mode\n-online = restores online mode\n-update (message) = Sends a Update though the update channel\n-warning (message) = Sends a Warning to the announcement channel\n-error (message) = sends a error to the announcement channel\n-announce (message) = Sends a announcement to the anouncement channel")
  }

  if(command === "status") {
    if(!message.member.roles.some(r=>["Mainframe Operator"].includes(r.name)) )
      return message.reply("Sorry, you are not a Mainframe Operator!");
      const sayMessage = args.join(" ");
      client.user.setActivity(sayMessage)
      client.user.setStatus("online")
  }
  
  if(command === "connect") {
    return message.reply("Connect Here!\nsteam://connect/198.143.138.91:27015")
  }
});

client.login(process.env.BOT_TOKEN);
