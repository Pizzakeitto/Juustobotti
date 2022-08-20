const { prefix } = require('../../config.json')
const Discord = require('discord.js')

module.exports = {
	name: 'help',
	description: 'List all of my commands or info about a specific command.',
	detailedDescription: 'A way to learn more about my cool commands! Do not type the [] <> you might see on some commands.',
	usage: 'help <command name>',
	execute(message = Discord.Message.prototype, args = []) {
        const {commands, commandAliases} = message.client
		const pfp = message.client.user.avatarURL({size: 64})

		if (args.length == 0) {
			// if no arguments give all the commands
			const embed = new Discord.EmbedBuilder
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
		} else if (commands.has(args[0]) || commandAliases.has(args[0])) {
			// If argument is some command (for example "ju!help ping") thats not hideden show more info
			const command = commands.get(args[0]) || commandAliases.get(args[0])
			if (command.hidden) return message.channel.send("👀")
			const embed = new Discord.EmbedBuilder
			embed.setAuthor({name: `How to ${command.name}`, iconURL: pfp})
			embed.description = command.detailedDescription
			if (command.usage) embed.addFields({name: "Usage: ", value: `${prefix}${command.usage}`})
			if (command.aliases) embed.addFields({name: "Aliases: ", value: `${command.aliases.join(", ")}`})
			embed.setColor("#00A000")
			message.channel.send({embeds: [embed]})
		} else {
			message.channel.send("Can't get help on a command that doesn't exist! Type \"ju!help\" to know all the commands.")
		}
       
	}
}