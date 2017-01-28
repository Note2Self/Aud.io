/* Discord */
const Discord = require(`discord.js`);
const client = new Discord.Client();
const broadcast = client.createVoiceBroadcast();

/* Queue */
const d_queue = [
  ["https://www.youtube.com/watch?v=RJOqJ-RitOg", "Steve Aoki & Louis Tomlinson - Just Hold On"],
  ["https://www.youtube.com/watch?v=_dK2tDK9grQ", "Ed Sheeran - Shape of You"],
  ["https://www.youtube.com/watch?v=papuvlVeZg8", "Clean Bandit - Rockabye"],
  ["https://www.youtube.com/watch?v=RhU9MZ98jxo", "The Chainsmokers - Paris"]
]
let queue = d_queue;

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
  const content = message.content.toLowerCase();

  if(content.startsWith(`a|join`)) {
    if(message.member.voiceChannel) {
      message.member.voiceChannel.join().then(vc => { vc.playBroadcast(broadcast); message.channel.sendMessage(':heavy_check_mark:'); })
    } else {
      message.channel.sendMessage(':exclamation: You need to be in a voice channel.');
    }
  }

  if(content.startsWith(`a|leave`)) {
    if(message.member.voiceChannel) {
      message.member.voiceChannel.leave();
      message.channel.sendMessage(':heavy_check_mark:');
    } else {
      message.channel.sendMessage(':exclamation: You need to be in a voice channel.');
    }
  }

  if(content.startsWith(`a|np`)) {
    message.channel.sendMessage(`:musical_note: Now playing **${queue[0][1]}**.`);
  }

  if(content.startsWith(`a|ping`)) {
    const now = new Date();
    message.channel.sendMessage(`Ping?`).then(sent => {
      sent.edit(`Pong! Took ${new Date() - now}ms.`);
    });
  }
})

/* Login */
client.login(require(`./config.json`).token);
