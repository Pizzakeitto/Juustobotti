const Discord = require('discord.js')
const fetch = require('node-fetch')
module.exports = {
    name: 'dog',
    description: 'doggo',
    execute(message = new Discord.Message, args = []){
        fetch(`https://api.udit.gq/api/dogimage`).then(res => res.json()).then(res => message.channel.send(res.dogimage))
    }
}