const { prefix } = require('../../config.json')
const Discord = require('discord.js')
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
	name: 'help',
	description: 'You\'re using this rn!.',
	detailedDescription: 'A way to learn more about my cool commands! Do not type the [] <> you might see on some commands.',
	usage: 'help <command name>',
	async execute(message = Discord.Message.prototype, args = []) {
        const {commands, commandAliases} = message.client
		const pfp = message.client.user.avatarURL({size: 64})

		if (args.length == 0) {
			// if no arguments give list of categories
			const embed = new Discord.EmbedBuilder
			embed.setColor('#00F000')
			embed.setAuthor({name: "Juustobotti's commands", iconURL: pfp})
			embed.setTitle("Here are the things I can do:")
			embed.addFields(
				{name: "🟣 osu! commands", value: "Some (useful?) osu! related commands", inline: true},
				{name: "💀 Funny commands", value: "🗿🗿🗿🗿🗿", inline: true},
				{name: "🎲 Games", value: "A bunch of gambling related thingies", inline: true},
				{name: "💸 Economy", value: "Money comes, money goes", inline: true},
				{name: "🔧 Utilities", value: "Some useful utilities", inline: true},
			)
			embed.setFooter({text: "Click the buttons to see commands from the categories"})

			// Add buttons to go thru the categories
			const buttonRow = new ActionRowBuilder()
			.addComponents(
				new ButtonBuilder({emoji: "🟣", style: ButtonStyle.Primary, custom_id: "osu"}),
				new ButtonBuilder({emoji: "💀", style: ButtonStyle.Primary, custom_id: "fun"}),
				new ButtonBuilder({emoji: "🎲", style: ButtonStyle.Primary, custom_id: "games"}),
				new ButtonBuilder({emoji: "💸", style: ButtonStyle.Primary, custom_id: "economy"}),
				new ButtonBuilder({emoji: "🔧", style: ButtonStyle.Primary, custom_id: "utility"}),
			)

			// Send message with buttons and make the callback async for ease of yes
			const sentMessage = await message.channel.send({embeds: [embed], components: [buttonRow]})
			const buttonPressCollector = sentMessage.createMessageComponentCollector({time: 5 * 60 * 1000 /* 5 minutes */})
			buttonPressCollector.on("collect", async buttonPressInteraction => {
				if (buttonPressInteraction.user.id != message.author.id) {
					// buttonPressInteraction.reply({content: "Sorry, only the person who used this command can click the buttons!! Do ju!help yourself if you wanna click em buttons", ephemeral: true})
					buttonPressInteraction.deferUpdate()
					return
				}
				console.log("here")
				
				// Button clicked by author
				// Lets clear the embed and get all the commands from the specified category
				embed.setFields()
				embed.setTitle(null)
				let listOfCommands = ''
				commands.map(command => {
					if(command.category == buttonPressInteraction.customId && !command.hidden)
						listOfCommands += `**${command.name}:** ${command.description}\n`
				})
				embed.setDescription(listOfCommands)

				let titleText = ""
				switch (buttonPressInteraction.customId) {
					case "osu":
						titleText = "🟣 osu! commands"; break
					case "games":
						titleText = "🎲 Gaming"; break
					case "economy":
						titleText = "💸 Economy"; break
					case "fun":
						titleText = "💀 Funny commands"; break
					case "utility":
						titleText = "🔧 Utilities"; break
						
				}
				embed.setTitle(titleText)

				// more usefulness
				embed.setFooter({text: `Btw, you can specify a command so for example ${prefix}help will show you more info about the help command!`})

				// Done modifying things, edit the message and update the interacton so  discord knows we got it
				buttonPressInteraction.deferUpdate()
				sentMessage.edit({embeds: [embed], components: [buttonRow]})
			})

			buttonPressCollector.once("end", () => {
				// Disable the buttons once the collector has timed out
				buttonRow.setComponents(
					new ButtonBuilder({emoji: "🟣", style: ButtonStyle.Primary, custom_id: "osu", disabled: true}),
					new ButtonBuilder({emoji: "💀", style: ButtonStyle.Primary, custom_id: "fun", disabled: true}),
					new ButtonBuilder({emoji: "🎲", style: ButtonStyle.Primary, custom_id: "games", disabled: true}),
					new ButtonBuilder({emoji: "💸", style: ButtonStyle.Primary, custom_id: "economy", disabled: true}),
					new ButtonBuilder({emoji: "🔧", style: ButtonStyle.Primary, custom_id: "utility", disabled: true}),
				)
			})

		} else if (commands.has(args[0]) || commandAliases.has(args[0])) {
			// If argument is some command (for example "ju!help ping") thats not hideden show more info
			const command = commands.get(args[0]) || commandAliases.get(args[0])
			if (command.hidden) return message.channel.send("👀")
			const embed = new Discord.EmbedBuilder
			embed.setAuthor({name: `How to ${command.name}`, iconURL: pfp})
			embed.setDescription(command.detailedDescription || null)
			if (command.usage) embed.addFields({name: "Usage: ", value: `${prefix}${command.usage}`})
			if (command.aliases) embed.addFields({name: "Aliases: ", value: `${command.aliases.join(", ")}`})
			embed.setColor("#00A000")
			message.channel.send({embeds: [embed]})
		} else {
			message.channel.send("Can't get help on a command that doesn't exist! Type \"ju!help\" to know all the commands.")
		}
       
	}
}