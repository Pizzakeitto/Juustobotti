const Discord = require('discord.js')
const { ServerConfig } = require('../../utils/mongoUtils')
var {prefix} = require('../../config.json')

module.exports = {
	name: 'serverprefix',
    aliases: ['prefix'],
	description: 'Change server prefix',
    hidden: true,
	async execute(message = Discord.Message.prototype, args = []) {
        const serverConfig = await ServerConfig.findOne({_id: message.guildId}) || new ServerConfig({
            _id: message.guildId,
            prefix: prefix
        })
        if (message.author.id != 246721024102498304) return message.channel.send("sorry")
        if (!args[0]) return message.channel.send("bro what you wanna set the prefix to??? ?? ? ??+?")
        serverConfig.prefix = args[0]
        serverConfig.save()
        message.channel.send(`ok this servers prefix is now ${args[0]}`)
	},
}