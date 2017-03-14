const Eris = require('eris');
const client = new Eris(require('./config.json').token, { maxShards: 1 })

client.connect();

client.on('ready', () => {
	console.log('Ready');
	client.editStatus('online', { name: 'version 4 rewrite.' })
})

client.on('messageCreate', message => {
	if(message.author.bot) return;
	if(message.content.startsWith('a|')) {
		let command = message.content.substring(2).split(" ")[0];
		let args = message.content.substring(3 + command.length);

		if(command == 'ping') {
			message.channel.createMessage(`**Pong!** ${client.shards.random().latency}ms`);
		} else if(command == 'join') {
			if(args == '') return message.channel.createMessage(`:warning: **Invalid station provided.**`);
			if(require('./stations.json')[args]) {
				if(!message.member.voiceState) return message.channel.createMessage(`:warning: **You need to be in a voice channel.**`);
				client.joinVoiceChannel(message.member.voiceState.channelID).then(vc => {
					if(vc.playing) vc.stopPlaying();
					message.channel.createMessage(`:play_pause: Streaming station **${args}**.`);
					vc.play(require('./stations.json')[args]);
				})
			} else {
				return message.channel.createMessage(`:warning: **Couldn't find a station with that name.** Make sure it has capitals and spelling correct.`);
			}
		}
	}
})
