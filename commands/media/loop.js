const Discord = require('discord.js');

module.exports = {
    name: 'loop',
    description: 'Toggle looping!!!',
    execute(message = new Discord.Message, args = [""]) {
        const voicechannel = message.member.voice.channel
        if (!voicechannel) return message.reply('You need to join a voice channel first!')
        if (message.guild.voice == undefined) return message.reply('What do I loop???')
        if (message.member.voice.channelID != message.guild.voice.channelID) message.channel.send('You need to be in the same channel as i am!!!')

        if (message.guild.voice.connection.loop == undefined) message.guild.voice.connection.loop = false
        if (message.guild.voice.connection.loop == false) {
            message.guild.voice.connection.loop = true
            message.reply('Ok im now looping !!')
            return
        }
        if (message.guild.voice.connection.loop == true) {
            message.guild.voice.connection.loop = false
            message.reply('Ok no longer looping!!')
            return
        }
    }
}