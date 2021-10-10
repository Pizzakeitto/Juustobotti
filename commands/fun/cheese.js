const Discord = require('discord.js')

module.exports = {
	name: 'cheese',
	description: 'Get a random cheese!!',
	execute(message = new Discord.Message, args = []) {
        const cheeses = require("./allthecheese.json")
        message.channel.send(cheeses[Math.floor(Math.random() * cheeses.length)])
    }
}