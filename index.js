const client = new (require('discord.js')).Client();
const token = require('./config.json').token;
const broadcaster = client.createVoiceBroadcast();

const default_queue = [
];

var queue = default_queue;

run = () => {
    client.channels.get('272495528355299328').sendMessage(`:arrow_forward: **Now playing** ${queue[0][1]}.`);
    client.user.setGame(queue[0][1], 'https://twitch.tv//');
    let dispatcher = broadcaster.playStream(require('ytdl-core')(queue[0][0]));
    dispatcher.once('end', () => {
      client.channels.get('272495528355299328').sendMessage(`:pause_button: **Finished playing** ${queue[0][1]}.`);
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
    client.channels.get('272495528355299328').sendMessage(`:white_check_mark: Ready! Starting stream...`).then(() => run());
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
        if(message.author.id != '116293018742554625' && message.author.id != '153244623219851266') return;
        try {
            message.channel.send(eval(message.content.substring(client.user.toString().length+6)), {code: 'js'}).catch(e => message.channel.sendMessage(e).then(m => console.log(e)));
        } catch(e) {
            message.channel.sendMessage(e);
        }
    }

    if(message.content.startsWith(client.user.toString() + ' np')) {
      message.channel.sendMessage(`**Now Playing:** ${queue[0][1]}`);
    }

    if(message.content.startsWith(client.user.toString() + ' help')) {
      const embed = new (require('discord.js')).RichEmbed()
      .setColor(0xFFA500)
      .setDescription("❯ All Commands\n\t\t`np` Show current song.\n\t\t`join` Join your voice channel.\n\t\t`leave` Leave your voice channel.\n\t\t`ping` Test bot / check song.")
      message.channel.sendEmbed(embed, '')
    }

    if(message.content.startsWith(client.user.toString() + ' stats')) {
      const embed = new (require('discord.js')).RichEmbed()
      .setColor(0xFFA500)
      .addField('Guilds', client.guilds.size, true)
      .addField('Streams', client.voiceConnections.size, true)
      .addField('Uptime', `${Math.round(client.uptime / (1000 * 60 * 60))}h ${Math.round(client.uptime / (1000 * 60)) % 60}m and ${Math.round(client.uptime / 1000) % 60}s`, true)
      message.channel.sendEmbed(embed, '')
    }
})

process.on('unhandledRejection', e => console.log(e))

client.login(token);
