/* Modules */
const Discord = require('discord.js');
const request = require('request');
const ytdl    = require('youtube-dl');
const superagent = require('superagent');
const client  = new Discord.Client();
const config  = require('./config.json');

/* Logger */
const logger = new Discord.WebhookClient(config.webhookid, config.webhooktoken);

/* Broadcasters */
const broadcasters = {
  'electro': { name: 'electro', broadcast: null, queue: [] },
  'chill': { name: 'chill', broadcast: null, queue: [] },
  'metal': { name: 'metal', broadcast: null, queue: [] }
}

/* Login */
client.login(config.token);

/* Commands */
const commands = {
  "ping": {
    "name": "ping",
    "desc": "Test's the bots status.",
    "args": "",
    "func": (message, args) => {
      message.channel.sendMessage(`**Pong!** Ping time: ${Math.round(client.ping)}ms.`);
    }
  },
  "stats": {
    "name": "stats",
    "desc": "Views the bots statistics.",
    "args": "",
    "func": async (message, args) => {
      let streams = await client.shard.broadcastEval(`this.voiceConnections.size`);
      streams = streams.reduce((a, b) => a + b);
      const embed = new Discord.RichEmbed()
      .setAuthor(message.author.username, message.author.displayAvatarURL)
      .addField('Guilds', client.guilds.size, true)
      .addField('Channels', client.users.size, true)
      .addField('Users', client.guilds.size, true)
      .addField('Used Memory', `${(process.memoryUsage().heapUsed / Math.pow(1024, 3)).toFixed(2)} GB`, true)
      .addField('Streams', client.voiceConnections.size, true)
      .addField('Shard', `${client.shard.id}/${client.shard.count}`, true)
      .setFooter(`Shard Statistics`)
      .setColor(0x7289DA)
      .setTimestamp();
      message.channel.sendEmbed(embed);
    }
  },
  "np": {
    "name": "np",
    "desc": "Shows whats currently playing.",
    "args": "<station>",
    "func": (message, args) => {
      if(args == '') return message.channel.sendMessage(`:warning: **No station has been passed.**\nPlease use \`np <station>\`.`);
      if(!broadcasters[args]) return message.channel.sendMessage(`:warning: **Invalid station.**`);

      message.channel.sendMessage(`Station **${args}** is now playing **${broadcasters[args].queue[0].title}**.`);
    }
  },
  "eval": {
    "name": "eval",
    "desc": "Evaluates code.",
    "args": "<js>",
    "func": (message, args) => {
      if(message.author.id != '116293018742554625' && message.author.id != '153244623219851266') return message.channel.sendMessage(`:x: **You do not have the correct permissions!**`);
      try {
        message.channel.sendCode('js', eval(args));
      } catch(e) {
        message.channel.sendCode('js', e);
      }
    }
  },
  "join": {
    "name": "join",
    "desc": "Joins your voice channel.",
    "args": "<station>",
    "func": async (message, args) => {
      if(args == '') args = 'electro';
      if(!message.member.voiceChannel) return message.channel.sendMessage(`:warning: **You need to be in a voice channel.**`);
      if(client.voiceConnections.get(message.guild.id)) await client.voiceConnections.get(message.guild.id).disconnect();
      if(!broadcasters[args]) return message.channel.sendMessage(`:x: **Not a valid station.**`);
      if(!broadcasters[args].broadcast) return message.channel.sendMessage(`:x: **This station has crashed, try again later.**`)
      message.member.voiceChannel.join().then(vc => {
        vc.playBroadcast(broadcasters[args].broadcast);
        message.channel.sendMessage(`:musical_note: **Now streaming** in ${message.member.voiceChannel.name}.`);
      })
    }
  },
  "leave": {
    "name": "leave",
    "desc": "Leaves your voice channel.",
    "args": "",
    "func": (message, args) => {
      if(!message.member.voiceChannel) return message.channel.sendMessage(`:warning: **You need to be in a voice channel.**`);
      message.member.voiceChannel.leave();
      message.channel.sendMessage(`:ok_hand:`);
    }
  },
  "help": {
    "name": "help",
    "desc": "Shows the commands.",
    "args": "",
    "func": (message, args) => {
      let desc = [];
      for(const cmd in commands) {
        desc.push(`**${commands[cmd].name} ${commands[cmd].args}**\n\t${commands[cmd].desc}`)
      }
      const embed = new Discord.RichEmbed()
      .setAuthor(message.author.username, message.author.displayAvatarURL)
      .setDescription(desc)
      .setFooter(`Commands`)
      .setColor(0x7289DA)
      .setTimestamp();
      message.channel.sendEmbed(embed);
    }
  },
  "cmds": {
    "name": "cmds",
    "desc": "Shows the commands.",
    "args": "",
    "func": (message, args) => {
      let desc = [];
      for(const cmd in commands) {
        desc.push(`**${commands[cmd].name} ${commands[cmd].args}**\n\t${commands[cmd].desc}`)
      }
      const embed = new Discord.RichEmbed()
      .setAuthor(message.author.username, message.author.displayAvatarURL)
      .setDescription(desc)
      .setFooter(`Commands`)
      .setColor(0x7289DA)
      .setTimestamp();
      message.channel.sendEmbed(embed);
    }
  },
  "stations": {
    "name": "stations",
    "desc": "Shows the stations.",
    "args": "",
    "func": (message, args) => {
      let desc = [];
      for(const station in broadcasters) {
        desc.push(`${broadcasters[station].name}`)
      }
      const embed = new Discord.RichEmbed()
      .setAuthor(message.author.username, message.author.displayAvatarURL)
      .addField('Stations', desc.join(', '), false)
      .setFooter(`Stations`)
      .setColor(0x7289DA)
      .setTimestamp();
      message.channel.sendEmbed(embed);
    }
  },
  "donate": {
    "name": "donate",
    "desc": "Shows a donate page.",
    "args": "",
    "func": (message, args) => {
      const embed = new Discord.RichEmbed()
      .setAuthor(message.author.username, message.author.displayAvatarURL)
      .addField('PayPal', '[Donate once via PayPal](https://paypal.me/JackMagic)')
      .addField('Patreon', '[Donate monthly via Patreon](https://patreon.com/JackMagic)')
      .setFooter(`Donations`)
      .setColor(0x7289DA)
      .setTimestamp();
      message.channel.sendEmbed(embed);
    }
  },
  "invite": {
    "name": "invite",
    "desc": "Views an invite link.",
    "args": "",
    "func": (message, args) => {
      message.channel.sendMessage(`**Support Server:** https://discord.gg/5CrXQbV\n**Invite Me!:** https://discordapp.com/oauth2/authorize?client_id=272419982619705346&scope=bot`);
    }
  }
}

/* Audio Manager */
function electro() {
  let dispatcher = broadcasters.electro.broadcast.playStream(ytdl(broadcasters.electro.queue[0].identifier));
  dispatcher.on('end', () => {
    broadcasters.electro.queue.splice(0, 1);
    if(!broadcasters.electro.queue[0]) {
      request("https://temp.discord.fm/libraries/electro-hub/json", function(err, res, body) {
        if(!err && res.statusCode == 200) {
          broadcasters.electro.broadcast = client.createVoiceBroadcast();
          broadcasters.electro.queue = JSON.parse(body);
          electro();
        }
      })
    } else {
      electro();
    }
  })
}
function chill() {
  let dispatcher = broadcasters.chill.broadcast.playStream(ytdl(broadcasters.chill.queue[0].identifier));
  dispatcher.on('end', () => {
    broadcasters.electro.queue.splice(0, 1);
    if(!broadcasters.electro.queue[0]) {
      request("https://temp.discord.fm/libraries/chill-corner/json", function(err, res, body) {
        if(!err && res.statusCode == 200) {
          broadcasters.electro.broadcast = client.createVoiceBroadcast();
          broadcasters.electro.queue = JSON.parse(body);
          chill();
        }
      })
    } else {
      chill();
    }
  })
}
function metal() {
  let dispatcher = broadcasters.metal.broadcast.playStream(ytdl(broadcasters.metal.queue[0].identifier));
  dispatcher.on('end', () => {
    broadcasters.metal.queue.splice(0, 1);
    if(!broadcasters.metal.queue[0]) {
      request("https://temp.discord.fm/libraries/metal-mix/json", function(err, res, body) {
        if(!err && res.statusCode == 200) {
          broadcasters.metal.broadcast = client.createVoiceBroadcast();
          broadcasters.metal.queue = JSON.parse(body);
          metal();
        }
      })
    } else {
      metal();
    }
  })
}

/* Events */
client.on('ready', () => {
  console.log(`[ Aud.io V3 ] Shard ${client.shard.id}/${client.shard.count} Ready`);
  client.user.setPresence({ status: 'online', game: { name: `${Object.keys(broadcasters).length} stations. - a|help`, url: 'https://twitch.tv/discordapp' } });
  request("https://temp.discord.fm/libraries/electro-hub/json", function(err, res, body) {
    if(!err && res.statusCode == 200) {
      broadcasters.electro.broadcast = client.createVoiceBroadcast();
      broadcasters.electro.queue = JSON.parse(body);
      electro();
    }
  })
  request("https://temp.discord.fm/libraries/chill-corner/json", function(err, res, body) {
    if(!err && res.statusCode == 200) {
      broadcasters.chill.broadcast = client.createVoiceBroadcast();
      broadcasters.chill.queue = JSON.parse(body);
      chill();
    }
  })
  request("https://temp.discord.fm/libraries/metal-mix/json", function(err, res, body) {
    if(!err && res.statusCode == 200) {
      broadcasters.metal.broadcast = client.createVoiceBroadcast();
      broadcasters.metal.queue = JSON.parse(body);
      metal();
    }
  })
})

client.on('message', async message => {
  if(message.content.startsWith('a|')) {
    let command = message.content.substring(2).split(" ")[0];
    let args    = message.content.substring(command.length + 3);

    if(commands[command]) {
      try {
        await commands[command].func(message, args);
      } catch(e) {
        message.channel.sendMessage(`:warning: **An error occurred.**\n${e}`);
      }
    }
  }
})


client.on('guildCreate', async guild => {
  /*let guilds = await client.shard.broadcastEval('this.guilds.size');
  guilds = guilds.reduce((a, b) => a + b);*/
  require('./discordbots.js')({ auth: config.discordbots, count: client.guilds.size })
  logger.sendMessage(`:inbox_tray: __**Shard ${client.shard.id}**__\nJoined **${guild.name}**.\nThere are **${guild.memberCount}** members.`)
})

client.on('guildDelete', async guild => {
  /*let guilds = await client.shard.broadcastEval('this.guilds.size');
  guilds = guilds.reduce((a, b) => a + b);*/
  require('./discordbots.js')({ auth: config.discordbots, count: client.guilds.size })
  logger.sendMessage(`:outbox_tray: __**Shard ${client.shard.id}**__\nJoined **${guild.name}**.\nThere are **${guild.memberCount}** members.`)
})

process.on('unhandledRejection', err => {
  console.error(err);
})
