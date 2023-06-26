const Discord = require('discord.js')
const { getUser } = require('../../utils/mongoUtils')
const { currency } = require('../../config.json')

module.exports = {
	name: 'withdraw',
    aliases: ['wit', 'with', 'get'],
	description: 'Withdraw money from your bank account to your wallet',
	detailedDescription: 'money goes',
    usage: 'withdraw <amount>',
	async execute(message = Discord.Message.prototype, args = []) {
        if (!args[0]) return message.channel.send("How much you wanna take bruh?")
        if (isNaN(args[0]) || args[0] <= 0) return message.channel.send("bruh")
        let amount = Number(Number(args[0]).toFixed(2))
		const user = await getUser(message.author.id)
        if (user.bank < amount) return message.channel.send("Your bank account doesnt have that much money lol")
        
        // Dood hads enough moeny, lsgo
        user.bank -= amount
        user.wallet += amount
        await user.save()
		message.channel.send(`You took ${amount}${currency} from your bank account, you now have ${user.wallet}${currency} in your wallet.`)
    }
}