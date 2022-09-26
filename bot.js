// Everything has been written by Pizzakeitto,
// using https://discordjs.guide/ as example :)

const Discord = require('discord.js')
require('dotenv').config()
const {prefix} = require('./config.json')
const fs = require('fs')

global.cooldownArray = []
global.definitionCooldownArray = []
global.timeoutCooldowns = {}
global.botStartTime = Date.now()

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
console.log(intents)
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

client.once('ready', () => {
    client.user.setStatus("online")
    console.log("Yah im alive aight")
    updateCustomStatus()
})

client.on('messageCreate', msg => {
    if (maintenancemode && msg.author.id != 246721024102498304) return
    if (msg.author.bot) return // If the message is sent by a bot, do nothing
    // If no perms to send message do nothing (a way to avoid crashing the bot lol)
    if (msg.guild) {
        if (!msg.guild.members.me.permissionsIn(msg.channel).has('SendMessages')) return console.log("no perms?")
    }
    if (msg.mentions.users.has(client.user.id)) {
        // msg.channel.send(`Why did you ping me??? Do ${prefix}help to see my commands bruh`)
	// Disabled because ppl get angry lol
    }
    let annoy = false
    if (msg.content.toLowerCase().includes('linux') && annoy){
        if (global.cooldownArray.includes(msg.author.id)) return;
        global.cooldownArray.push(msg.author.id)
        setTimeout(() => {
            global.cooldownArray = global.cooldownArray.filter(function(value, index, arr) {
                return value != msg.author.id
            })
        }, 120000);
        msg.channel.sendTyping()
        setTimeout(() => {
            msg.channel.send(`I'd just like to interject for a moment. What you're referring to as Linux, is in fact, GNU/Linux, or as I've recently taken to calling it, GNU plus Linux. Linux is not an operating system unto itself, but rather another free component of a fully functioning GNU system made useful by the GNU corelibs, shell utilities and vital system components comprising a full OS as defined by POSIX.`)
        }, 5000);
    }

    if (msg.content.toLowerCase().includes('owo') || msg.content.toLowerCase().includes('uwu') ) {
        msg.channel.send("ok")
    }

    if (msg.content.toLowerCase().startsWith("ju?")) return msg.channel.send("ju?")
    if (!msg.content.toLowerCase().startsWith(prefix)) return //If the message doesn't start with the prefix, do nothing

    const args = msg.content.slice(prefix.length).trim().split(/ +/) //splits the arguments into an array, every space is the split point thingy
    const commandName = args.shift().toLowerCase() //gets what the commands name is and makes it lowercase so it aint case sensitive

    // If theres no command found with the name, .get will return 'undefined', so the || thingy makes the other thing run idk hwo to explain this
    // JAvascript magic
    const command = client.commands.get(commandName) || client.commandAliases.get(commandName)
    if (!command) return msg.channel.send("I don't know that command! Check the available commands with ju!help")

    try{
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

process.on('exit', function() {
    client.destroy()
})

process.on('SIGINT', function() {
    client.destroy()
    process.abort()
})

// For nodemon bc it sends this kinda signal
process.on('SIGUSR2', function() {
    client.destroy()
})

function updateCustomStatus() {
    if (maintenancemode) {
        client.user.setStatus("dnd")
        client.user.setActivity('my creator suck at coding! (Down for maintenance)', {type: Discord.ActivityType.Watching})
    } else client.user.setActivity('the bean market. Type ju!help to get me commands. I own a bean field btw', {type: Discord.ActivityType.Competing})
}

client.login(process.env.BOTTOKEN) //Login lol
