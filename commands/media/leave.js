const Discord = require('discord.js')
const { getVoiceConnection } = require('@discordjs/voice')

module.exports = {
    name: 'leave',
    description: 'leave the voice channel',
    detailedDescription: 'you dont. if you really want heres a door: 🚪',
    execute(message = new Discord.Message, args = [""]) {
        getVoiceConnection(message.channel.guild.id).destroy()
        message.react('✅')
    }
}