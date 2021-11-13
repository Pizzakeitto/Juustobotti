// Everything has been written by Pizzakeitto,
// using https://discordjs.guide/ as example :)

const Discord = require('discord.js');
require('dotenv').config();
const {prefix} = require('./config.json');
const fs = require('fs');

const client = new Discord.Client();

//Read commands from the commands directory
client.commands = new Discord.Collection();
const commandFolders = fs.readdirSync('./commands');

for(const folder of commandFolders) {
    const commandFiles = fs.readdirSync(`./commands/${folder}`).filter(file => file.endsWith('.js'));
    for(const file of commandFiles){
        const command = require(`./commands/${folder}/${file}`);
        client.commands.set(command.name, command);
    }
}

client.once('ready', () => {
    client.user.setStatus("online")
    console.log("Yah im alive aight");
    updateCustomStatus()
    /* let updateEveryMinutes = 5, theInterval = updateEveryMinutes * 60 * 1000;
    setInterval(function() {
        updateCustomStatus();
    }, theInterval);*/
    // I dont think this needs to be run on an interval
})

client.on('message', msg => {
    if (msg.author.bot) return; // If the message is sent by a bot, do nothing
    if (msg.mentions.users.has(client.user.id)) {
        msg.channel.send(`Why did you ping me??? Do ${prefix}help to see my commands bruh`)
    }
    if (!msg.content.toLowerCase().startsWith(prefix)) return; //If the message doesn't start with the prefix, do nothing

    if (!msg.guild) return msg.channel.send("Cant do in dms lol")
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

client.on("guildCreate", async guild => {
    let msg = new Discord.Message
    msg = `I joined a guild named ${guild.name} with id being ${guild.id}.\nThere are ${guild.memberCount} members right now. Should I leave?`

    let pizzakeitto = await client.users.fetch('246721024102498304')
    msg = await pizzakeitto.send(msg)
    await msg.react('✅')
    await msg.react('❎')

    msg.awaitReactions(r => ['✅', '❎'].includes(r.emoji.name), {max: 1}).then(collected => { 
        let r = collected.first();

        if(r.emoji.name == '✅') {
            guild.leave();
            pizzakeitto.send('Ok im gone 👋')
        } else {
            msg.channel.send('Ok im staying')
        }
    })
    
})

process.on('exit', function() {
    client.destroy();
})

process.on('SIGINT', function() {
    client.destroy();
    process.abort();
})

function updateCustomStatus() {
    client.user.setActivity('the chat :) Type ju!help for more', {type: 'COMPETING'})
}

client.login(process.env.BOTTOKEN); //Login lol