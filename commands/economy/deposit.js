const Discord = require('discord.js')
const { getUser } = require('../../utils/mongoUtils')
const { currency } = require('../../config.json')

module.exports = {
	name: 'deposit',
    aliases: ['dep', 'put'],
	description: 'Deposit money from your wallet to your bank account',
	detailedDescription: 'money goes',
    usage: 'deposit <amount>',
	async execute(message = Discord.Message.prototype, args = []) {
        if (!args[0]) return message.channel.send("How much you wanna deposit bruh?")
        if (isNaN(args[0]) || args[0] <= 0) return message.channel.send("bruh")
        let amount = Number(Number(args[0]).toFixed(2))
		const user = await getUser(message.author.id)
        if (user.wallet < amount) return message.channel.send("Your wallet doesnt have that much money lol")
        
        // Dood hads enough moeny, lsgo
        user.wallet -= amount
        user.bank += amount
        await user.save()
		message.channel.send(`You deposited ${amount}${currency} to your bank account, you now have ${user.wallet}${currency} in your wallet.`)
    }
}