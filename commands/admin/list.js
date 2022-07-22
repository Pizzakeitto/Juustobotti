const Discord = require('discord.js')

module.exports = {
	name: 'listservers',
	description: 'listaa mis servuis oon',
    hidden: true,
	async execute(message = Discord.Message.prototype, args = []) {
        if (message.author.id != '246721024102498304') return message.channel.send(`Sorry ${message.author.username}, I can't do that`)
        let serverlist = ""
        for (const guild of message.client.guilds.cache) {
            const owner = await guild[1].fetchOwner()
            serverlist += `${guild[1].name}: ${guild[1].memberCount} members, Owner ${owner.user.tag} (${guild[1].ownerId})\n`
            
        }
        message.reply(`I am currently in these servers: \n${serverlist}`)
    }
}