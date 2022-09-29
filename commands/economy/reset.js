const Discord = require('discord.js')
const { getUser } = require('../../utils/mongoUtils')
const { currency } = require('../../config.json')

module.exports = {
	name: 'reset',
	description: 'Reset your profile if you stuck lol',
	detailedDescription: 'You can destroy your profile with this command, just make sure you\'re sure you want to do this',
    usage: 'reset',
	async execute(message = Discord.Message.prototype, args = []) {
		const user = await getUser(message.author.id)
        let captcha = ""
        const letters = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", "1", "2", "3", "4", "5", "6", "7", "8", "9"]
        for (let i = 0; i < 5; i++) captcha += letters[Math.floor(Math.random()*letters.length)]
		await message.channel.send(`Are you sure you want to do this??? You cant go back from this. Type \`${captcha}\` in chat if you want to do this.`)

        const collectedMessage = await message.channel.awaitMessages({filter: m => m.author.id == message.author.id, time: 60000, max: 1})
        if(collectedMessage.first() && collectedMessage.first().content.toLowerCase() == captcha.toLowerCase()) {
            // dude agreed to reset, lets do it
            await user.delete()
            message.channel.send("Ok i reset your account, have a good new life")
        } else {
            // no message
            message.channel.send("Cancelled.")
        }
    }
}