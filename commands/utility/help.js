const { prefix } = require('../../config.json')
const Discord = require('discord.js')

module.exports = {
	name: 'help',
	description: 'List all of my commands or info about a specific command.',
	detailedDescription: 'A way to learn more about my cool commands! Do not type the [] <> you might see on some commands.',
	usage: 'help <command name>',
	execute(message = Discord.Message.prototype, args = []) {
        const {commands} = message.client
		const pfp = "https://cdn.discordapp.com/avatars/733444772869701665/2d0ebe27d13cf726f779a3deaa2ff605.webp?size=64"

		if (args.length == 0) {
			// if no arguments give all the commands
			const embed = new Discord.MessageEmbed
			embed.setAuthor({name: "Juustobotti's commands", iconURL: pfp})
			embed.setTitle("Here is all of my commands:")
	
			let formattedCommands = ''
			commands.map(command => {
				if (command.hidden) return
				formattedCommands += `**${prefix}${command.name}**: ${command.description}\n`
			})
			embed.setDescription(formattedCommands)
			embed.setColor('#00F000')
			message.channel.send({embeds: [embed]})
		} else if (commands.has(args[0])) {
			// If argument is some command (for example "ju!help ping") thats not hideden show more info
			const command = commands.get(args[0])
			if (command.hidden) return message.channel.send("👀")
			const embed = new Discord.MessageEmbed
			embed.setAuthor({name: `How to ${command.name}`, iconURL: pfp})
			embed.description = command.detailedDescription
			if (command.usage) embed.addField("Usage: ", `${prefix}${command.usage}`)
			embed.setColor("#00A000")
			message.channel.send({embeds: [embed]})
		} else {
			message.channel.send("Can't get help on a command that doesn't exist! Type \"ju!help\" to know all the commands.")
		}
       
	}
}