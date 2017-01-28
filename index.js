/* Discord */
const Discord = require(`discord.js`);
const client = new Discord.Client();
const broadcast = client.createVoiceBroadcast();

/* Queue */
const json = require(`./queue.json`).songs;
const d_queue = json;
let queue = d_queue;

/* Commands */
const commands = {
  'ping': {
    name: 'ping',
    info: 'Checks the bots ping time.',
    func: (message, args) => {
      const now = new Date();
      message.channel.sendMessage(`Ping?`).then(sent => {
        sent.edit(`Pong! Took ${new Date() - now}ms.`);
      });
    }
  },
  'np': {
    name: 'np',
    info: 'Sees whats currently playing.',
    func: (message, args) => {
      message.channel.sendMessage(`:musical_note: Now playing **${queue[0][1]}**.`);
    }
  },
  'join': {
    name: 'join',
    info: 'Joins your voice channel and starts streaming.',
    func: (message, args) => {
      if(message.member.voiceChannel) {
        message.member.voiceChannel.join().then(vc => { vc.playBroadcast(broadcast); message.channel.sendMessage(':heavy_check_mark:'); })
      } else {
        message.channel.sendMessage(':exclamation: You need to be in a voice channel.');
      }
    }
  },
  'leave': {
    name: 'leave',
    info: 'Leavs your voice channel.',
    func: (message, args) => {
      if(message.member.voiceChannel) {
        message.member.voiceChannel.leave();
        message.channel.sendMessage(':heavy_check_mark:');
      } else {
        message.channel.sendMessage(':exclamation: You need to be in a voice channel.');
      }
    }
  },
  'help': {
    name: 'help',
    info: 'Shows commands for the bot.',
    func: (message, args) => {
      let final = ``;
      for(const command in commands) {
        final += `\n${commands[command].name}\n\t${commands[command].desc}`
      }

      message.channel.sendMessage(`__**Commands**__\n${final}`);
    }
  }
}

/* Run */
function run() {
  client.user.setGame(queue[0][1], `https://twitch.tv//`);
  const dispatcher = broadcast.playStream(require('ytdl-core')(queue[0][0]));
  dispatcher.once('end', () => {
    queue.splice(0, 1);
    if(queue[0]) {
      run();
    } else {
      queue = d_queue;
      run();
    }
  })
}

/* Events */
client.on('ready', () => {
  console.log('Ready.');
  client.channels.get('272495528355299328').sendMessage(`:heavy_check_mark: Ready!`);
  run();
  client.channels.get('275044052666417162').join().then(vc => { vc.playBroadcast(broadcast); });
});

client.on('message', message => {
  if(message.content.startsWith('a|')) {
    let command = message.content.substring(2).split(" ")[0];
    let args = message.content.substring(3 + command.length);

    if(commands[command]) {
      try {
        commands[command].func(message, args);
      } catch(e) {
        console.error(e);
      }
    }
  }
})

/* Login */
client.login(require(`./config.json`).token);
