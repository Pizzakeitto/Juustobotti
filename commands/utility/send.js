const Discord = require('discord.js')

module.exports = {
	name: 'send',
	description: 'send mesasge to a chanel',
    hidden: true,
	async execute(message = new Discord.Message, args = []) {
        if (message.author.id != '246721024102498304') return message.reply('Sorry bro youre not pizzaman')
        if (!args[0]) return message.reply('Bruh where do i send stuff to?')
        if (!args[1]) return message.reply('Bruh what do i send?')

        const channel = await message.client.channels.fetch(args[0])

        if(!channel) return message.reply('Chanel doesnt exist!!!')   
        if(!channel.isText()) return message.reply('This isnt a text channel!')

        args.shift()
        channel.send(args.join(' '))
	}
}