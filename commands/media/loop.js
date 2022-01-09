const Discord = require('discord.js')

module.exports = {
    name: 'loop',
    description: 'Toggle looping!!!',
    execute(message = Discord.Message.prototype, args = [""]) {
        const voicechannel = message.member.voice.channel
        if (!voicechannel) return message.reply('You need to join a voice channel first!')
        if (voicechannel.id != message.guild.me.voice.channelId) message.channel.send('You need to be in the same channel as i am!!!')

        // IF ITS LOOPING message.guild.me.voice.channel.loop == TRUE !!!!!!!!!!!!!!
        if (message.guild.me.voice.channel.loop == undefined) message.guild.me.voice.channel.loop = false
        if (message.guild.me.voice.channel.loop == false) {
            message.guild.me.voice.channel.loop = true
            message.reply('Ok im now looping !!')
            return
        }
        if (message.guild.me.voice.channel.loop == true) {
            message.guild.me.voice.channel.loop = false
            message.reply('Ok no longer looping!!')
            return
        }
    }
}