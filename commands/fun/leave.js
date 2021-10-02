const Discord = require('discord.js');

module.exports = {
    name: 'leave',
    description: 'leave a voice',
    execute(message = new Discord.Message, args = [""]) {
        message.guild.voice.channel.leave()
        message.react('✅')
    }
}