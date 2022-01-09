const Discord = require('discord.js')
const { getVoiceConnection } = require('@discordjs/voice')

module.exports = {
    name: 'leave',
    description: 'leave a voice',
    execute(message = new Discord.Message, args = [""]) {
        getVoiceConnection(message.channel.guild.id).destroy()
        message.react('✅')
    }
}