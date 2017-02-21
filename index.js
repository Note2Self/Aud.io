/* Modules */
const Discord = require('discord.js');
const Manager = new Discord.ShardingManager(`./Client.js`);

/* Spawn */
Manager.spawn(1);
