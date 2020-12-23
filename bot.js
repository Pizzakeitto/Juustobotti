const Discord = require('discord.js');
require('dotenv').config();
const {prefix} = require('./config.json');
const fs = require('fs');
const { time } = require('console');

const client = new Discord.Client();

//Read commands from the commands directory
client.commands = new Discord.Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for(const file of commandFiles){
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command);
}

client.on('ready', () => {
    console.log("Yah im alive aight");
    updateCustomStatus
    let updateEveryMinutes = 5, theInterval = updateEveryMinutes * 60 * 1000;
    setInterval(function() {
        updateCustomStatus();
    }, theInterval);
})

client.on('message', msg => {
    if (!msg.content.startsWith(prefix) || msg.author.bot) return; //If the message doesn't start with the prefix or the one who sent the message is a bot, do nothing

    const args = msg.content.slice(prefix.length).trim().split(/ +/); //splits the arguments into an array, every space is the split point thingy
    const commandName = args.shift().toLowerCase(); //gets what the commands name is and makes it lowercase so it aint case sensitive

    if (!client.commands.has(commandName)) return msg.channel.send("I don't know that command! Check the available commands with ju!help");

    const command = client.commands.get(commandName); //gets the actual command object

    try{
        command.execute(msg, args);
    } catch (error) {
        console.error(error);
        msg.reply("There was an error while executing this command! (the error has been logged)");
    }
})

function updateCustomStatus() {
    client.user.setActivity('you :) Type ju!help to find out more', {type: 'WATCHING'})
}

client.login(process.env.BOTTOKEN); //Login lol