const Discord = require('discord.js')
const { getUser } = require('../../utils/mongoUtils')
const { currency } = require('../../config.json')

module.exports = {
	name: 'balance',
    aliases: ['bal'],
	description: 'Check your balance NOW!',
	detailedDescription: 'You can check your wallet and your bank balance with this command 😁😁😁😁😁😁😁',
	async execute(message = Discord.Message.prototype, args = []) {
		const user = await getUser(message.author.id)
		message.channel.send(`You have ${user.wallet}${currency} in your wallet and ${user.bank}${currency} in your bank.`)
    }
}