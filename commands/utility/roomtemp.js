// IF YOURE FORKING/CLONING MY REPO THIS COMMAND WILL NOT WORK FOR YOU!!!!!!!!!
// (unless you have something networking capable running a tcp server
//  thats returning data from a temperature sensor)
// IF you wanna know more dm me !!!!!111!11


const Discord = require('discord.js')
const net = require('net')

module.exports = {
	name: 'roomtemp',
	description: 'Read the temperature in pizzas room!',
	aliases: ['pizza'],
	execute(message = Discord.Message.prototype, args = []) {
        const connection = net.createConnection({host: process.env.HOMEIP, port: 4727, timeout: 2500}, () => {
            console.log("connected")
        })

        connection.once('data', (data) => {
            data = data.toString().trim()

            if(data.startsWith("0")) {
                let datapieces = data.split(" ")
                const humidity = Number(datapieces[1]).toFixed(0)
                const temperature = Number(datapieces[2]).toFixed(1)
                const heatindex = Number(datapieces[3]).toFixed(1)

                const embed = new Discord.MessageEmbed
                embed.setTitle("The burning hell that is Pizzakeitto's room")
                embed.setDescription(`Humidity: ${humidity}%\nTemperature: ${temperature}°c\nHeat Index: ${heatindex}°c`)
                message.channel.send({embeds: [embed]})
            }
        })

        connection.on('error', (err) => {
            console.log(err)
            message.channel.send("huh, something weird happened, try again later?")
        })

        connection.on('timeout', () => {
            console.log("temp sensor timed out")
            message.channel.send("huh, i cant reach pizzakeittos temperature sensor right now, try again later")
            connection.destroy()
        })
    }
}