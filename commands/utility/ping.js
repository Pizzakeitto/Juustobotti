const Discord = require('discord.js')

module.exports = {
	name: 'ping',
	description: 'Pong!',
	detailedDescription: 'Gets message goaround time and the latency of the Discord API.',
	execute(message = Discord.Message.prototype, args = []) {
		// Credits for this one goes to https://stackoverflow.com/a/64750764
		// I steal too much code ¯\_(ツ)_/¯
		message.channel.send('Loading...').then (async (msg) =>{
			let uptimeSeconds = Math.floor((Date.now() - global.botStartTime) / 1000)
			let uptimeMinutes = Math.floor(uptimeSeconds / 60)
			let uptimeHours   = Math.floor(uptimeMinutes / 60)
			let uptimeDays    = Math.floor(uptimeHours / 24)

			uptimeSeconds -= uptimeMinutes * 60
			uptimeMinutes -= uptimeHours * 60
			uptimeHours -= uptimeDays * 24

			let uptime
			if (uptimeDays) 				uptime = `${uptimeDays} day${s(uptimeDays)}`
			if (uptimeDays && uptimeHours) 	uptime += ` and ${uptimeHours} ${h(uptimeHours)}`
			if (!uptimeDays) {
				if (uptimeHours) 			uptime = `${uptimeHours} ${h(uptimeHours)}`
				if (uptimeHours && uptimeMinutes) uptime += ` and ${uptimeMinutes} minute${s(uptimeMinutes)}`
				else if (uptimeMinutes)		uptime = `${uptimeMinutes} minute${s(uptimeMinutes)}`
				else 						uptime = `${uptimeSeconds} second${s(uptimeSeconds)}`
			}

			// Cool but unreadable so not using this
			// uptimeDays ? `${uptimeDays} days${uptimeHours ? ` and ${uptimeHours} hours` : ""}` : `${uptimeHours} hours and ${uptimeMinutes} minutes`

			msg.edit(`🏓 Latency is ${msg.createdTimestamp - message.createdTimestamp}ms. API Latency is ${Math.round(message.client.ws.ping)}ms\n⏱ Uptime: ${uptime}`)
		})
	},
}

function s(i) {
	if(i > 1) return "s"
	else return ""
}

function h(i) {
	if(i > 1) return "hours"
	else return "hour"
}