const Discord = require('discord.js')

module.exports = {
	name: 'cheese',
	description: 'Get a random cheese!!',
    detailedDescription: 'Hard time choosing a cheese in the store, or just want to be amused by the world of cheese???',
	execute(message = new Discord.Message, args = []) {
        const cheeses = require("./allthecheese.json")
        message.channel.send(cheeses[Math.floor(Math.random() * cheeses.length)])
    }
}