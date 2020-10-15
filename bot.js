const Discord = require('discord.js');
const {bottoken,osutoken} = require('./tokens.json');
const token = 'ju!';

const client = new Discord.Client();

client.on('ready', () => {
    console.log("Yah im alive aight");
})

client.login(bottoken);