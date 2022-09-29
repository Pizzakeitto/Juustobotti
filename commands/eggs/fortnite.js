const Discord = require('discord.js')

module.exports = {
	name: 'fortnite',
	description: 'fortnite',
	detailedDescription: 'you dont.',
	hidden: true,
	execute(message = new Discord.Message, args = []) {
        message.channel.send('fuck fortnite')
    }
}