// Everything has been written by Pizzakeitto,
// using https://discordjs.guide/ as example :)

const Discord = require('discord.js')
require('dotenv').config()
var {prefix} = require('./config.json')
const fs = require('fs')
const mongoose = require('mongoose')
const { ServerConfig } = require('./utils/mongoUtils')
const axios = require('axios').default

global.cooldownArray = []
global.definitionCooldownArray = []
global.timeoutCooldowns = {}
global.botStartTime = Date.now()
global.usersInChat = []
global.responding = []

const maintenancemode = false

// Great, intents got even worse
// Dear discord.js, can you not be breaking my code constantly, ty!
// - Pizzakeitto, Written when discordjs v14 was released

const intents = []
intents.push(
    Discord.GatewayIntentBits.Guilds,
    Discord.GatewayIntentBits.DirectMessages,
    Discord.GatewayIntentBits.GuildMessages,
    Discord.GatewayIntentBits.MessageContent,
    Discord.GatewayIntentBits.GuildMessageReactions,
    Discord.GatewayIntentBits.DirectMessageReactions
)
const partials = []
partials.push(Discord.Partials.Message, Discord.Partials.Channel, Discord.Partials.Reaction)

const client = new Discord.Client({
    intents: intents,
    partials: partials// Why are these a thing? (required for dms)
})

//Read commands from the commands directory
client.commands = new Discord.Collection()
client.commandAliases = new Discord.Collection()
const commandFolders = fs.readdirSync('./commands')

for(const folder of commandFolders) {
    const commandFiles = fs.readdirSync(`./commands/${folder}`).filter(file => file.endsWith('.js'))
    for(const file of commandFiles){
        const command = require(`./commands/${folder}/${file}`)
        // Give each command its own category based on the folder name
        command.category = folder
        client.commands.set(command.name, command)
        if (command.aliases) {
            command.aliases.forEach(alias => client.commandAliases.set(alias, command))
        }
    }
}

client.once('ready', async () => {
    client.user.setStatus("online")
    console.log("Yah im alive aight")
    await mongoose.connect("mongodb://localhost:27017/juustobot")
    .catch(err => {
        console.log("Failed to connect to mongodb!")
    })
    console.log("Connected to mongodb!")
    updateCustomStatus()
})

client.on('messageCreate', async msg => {
    // not ideal but too lazy to get an actual fix going
    let prefix = require('./config.json').prefix

    if (maintenancemode && msg.author.id != 246721024102498304) return
    if (msg.author.bot) return // If the message is sent by a bot, do nothing
    // If no perms to send message do nothing (a way to avoid crashing the bot lol)
    if (msg.guild) {
        if (!msg.guild.members.me.permissionsIn(msg.channel).has('SendMessages')) return console.log("no perms?")
    }

    // Chat
    // removed cus fck ai


    if ((/(?<!\p{L})king(?!\p{L})/gu).test(msg.content.toLowerCase())){
        msg.channel.send('gg')
    }

    if (msg.content.toLowerCase().startsWith("ju?")) return msg.channel.send("ju?")
    // Check if server has its own prefix
    let serverConfig = await ServerConfig.findOne({_id: msg.guildId}) || new ServerConfig({
        _id: msg.guildId,
        prefix: prefix
    })
    if (serverConfig.prefix) prefix = serverConfig.prefix
    if (!msg.content.toLowerCase().startsWith(prefix)) return //If the message doesn't start with the prefix, do nothing

    const args = msg.content.slice(prefix.length).trim().split(/ +/) //splits the arguments into an array, every space is the split point thingy
    const commandName = args.shift().toLowerCase() //gets what the commands name is and makes it lowercase so it aint case sensitive

    // If theres no command found with the name, .get will return 'undefined',
    // so the || thingy makes the other thing run idk hwo to explain this
    // JAvascript magic
    const command = client.commands.get(commandName) || client.commandAliases.get(commandName)
    if (!command) return msg.channel.send(`I don't know that command! Check the available commands with ${prefix}help`)

    // Before running command set *global* prefix to the thing
    global.prefix = prefix
    try {
        command.execute(msg, args)
    } catch (error) {
        console.log(error)
        msg.reply("There was an error while executing this command! (the error has been logged)")
        .catch(errorsenderror => {
            console.log(errorsenderror)
        })
    }
})

client.on("guildCreate", async guild => {
    let msg = Discord.Message.prototype // For that sweet vscode intellisense..
    msg = `I joined a guild named ${guild.name} with id being ${guild.id}.\nThere are ${guild.memberCount} members right now. Should I leave?`

    let pizzakeitto = await client.users.fetch('246721024102498304')
    msg = await pizzakeitto.send(msg)
    await msg.react('✅')
    await msg.react('❎')

    const filter = (reaction, user) => user.id == '246721024102498304' && ['✅', '❎'].includes(reaction.emoji.name)
    msg.awaitReactions({filter, max: 1}).then(collected => { 
        console.log("Got reaction")
        console.log(collected)
        let r = collected.first()

        if(r.emoji.name == '✅') {
            guild.leave()
            pizzakeitto.send('Ok im gone 👋')
        } else {
            msg.channel.send('Ok im staying')
        }
    })
    
})

// Uptime Kuma
setInterval(() => {
   axios.get(process.env.UPTIMEKUMA) 
}, 60000)

process.on('exit', function() {
    client.destroy()
    mongoose.disconnect()
})

process.on('SIGINT', function() {
    client.destroy()
    mongoose.disconnect()
    process.abort()
})

// For nodemon bc it sends this kinda signal
process.on('SIGUSR2', function() {
    client.destroy()
    mongoose.disconnect()
})

function updateCustomStatus() {
    if (maintenancemode) {
        client.user.setStatus("dnd")
        client.user.setActivity('balls. im not currently available', {type: Discord.ActivityType.Watching})
    } else client.user.setActivity('Fortnite', {type: Discord.ActivityType.Playing})
}

client.login(process.env.BOTTOKEN) //Login lol
