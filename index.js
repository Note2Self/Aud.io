const client = new (require('discord.js')).Client();
const token = require('./config.json').token;
const broadcaster = client.createVoiceBroadcast();

const default_queue = [
  ['url', 'name']
];

var queue = default_queue;

run = () => {
    const dispatcher = broadcaster.playStream(require('ytdl-core')(queue[0][0]));
    client.user.setGame(queue[0][1], 'https://twitch.tv//');
    dispatcher.on('end', () => {
        queue.splice(0, 1);
        if(!queue[0]) {
            queue = default_queue;
            run();
        } else {
            run();
        }
    })
}

client.on('ready', () => {
    run();
})

client.on('message', message => {
    if(message.content == client.user.toString() + ' join') {
        try {
            message.member.voiceChannel.join().then(vc => {
                vc.playBroadcast(broadcaster);
                message.channel.sendMessage(":white_check_mark: **Done!** Should be streaming now.");
            })
        } catch(e) {
            console.log(e);
            message.channel.sendMessage('**:warning: Warning** An error occurred.');
        }
    }

    if(message.content == client.user.toString() + ' ping') {
        message.channel.sendMessage(`**Pong!** Streaming ${queue[0][1]}.`);
    }

    if(message.content == client.user.toString() + ' leave') {
        try {
            message.member.voiceChannel.leave();
            message.channel.sendMessage(":white_check_mark: **Done!** Will no longer stream here.");
        } catch(e) {
            console.log(e);
            message.channel.sendMessage('**:warning: Warning** An error occurred.');
        }
    }

    if(message.content.startsWith(client.user.toString() + ' eval ')) {
        if(message.author.id != '116293018742554625') return;
        try {
            message.channel.sendMessage(eval(message.content.substring(client.user.toString().length+6)));
        } catch(e) {
            message.channel.sendMessage(e);
        }
    }

    if(message.content.startsWith(client.user.toString() + ' np')) {
      message.channel.sendMessage(`**Now Playing:** ${queue[0][1]}`);
    }
})

client.login(token);
