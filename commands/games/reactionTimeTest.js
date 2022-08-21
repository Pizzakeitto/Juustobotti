const Discord = require('discord.js')

module.exports = {
	name: 'reactiontest',
	description: 'Test your reaction time!',
	detailedDescription: 'This is a test of your reaction time. How to play: When you use the command, get ready! As soon as you see the green square, send a message! \n\n(note: there might be some latency between your message being sent and me seeing it, so I might show the incorrect reaction time :pensive:)',
	execute(message = Discord.Message.prototype, args = []) {
        // let ping = Date.now() - message.createdTimestamp + " ms" // how i did it before
        // message.channel.send("Bot's ping is `" + `${Date.now() - message.createdTimestamp}` + " ms`")
		message.channel.send('Wait for green...').then( async msg => {
            const latency = msg.createdTimestamp - message.createdTimestamp
            const juusto = new Date()

            const reactionTime = Math.round(Math.random() * (4000 - 2000 /*Max, Min*/) + 2000)

            const filter = m => m.author.id === message.author.id
            message.channel.awaitMessages({filter, max: 1, time: 5000}).then(reaction => {
                if (!reaction.first()) return message.channel.send("You didn't do anything :(")
                message.channel.send(`Your reaction time was ${new Date - reactionTime - juusto - latency - latency}ms. Incredible!`)
            })
			setTimeout(() => {
                if (message.guild.members.me.permissions.has("AddReactions")) msg.react('🟩').catch(() => null)
                else msg.channel.send('🟩')
            }, reactionTime);
		})
	},
}