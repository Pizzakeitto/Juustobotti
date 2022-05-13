const Discord = require('discord.js')

module.exports = {
	name: 'ping',
	description: 'Pong!',
	detailedDescription: 'Gets message goaround time and the latency of the Discord API.',
	execute(message = Discord.Message.prototype, args = []) {
        // let ping = Date.now() - message.createdTimestamp + " ms" // how i did it before
        // message.channel.send("Bot's ping is `" + `${Date.now() - message.createdTimestamp}` + " ms`")
		// Keeping this here just in case 💼

		// Credits for this one goes to https://stackoverflow.com/a/64750764
		// I steal too much code ¯\_(ツ)_/¯
		message.channel.send('Loading data').then (async (msg) =>{
			msg.edit(`🏓 Latency is ${msg.createdTimestamp - message.createdTimestamp}ms. API Latency is ${Math.round(message.client.ws.ping)}ms`)
		})
	},
}