const Discord = require('discord.js');

module.exports = {
    name: 'homer',
    description: 'homer',
    execute(message = new Discord.Message, args = [""]) {
        const voicechannel = message.member.voice.channel
        if (!voicechannel) return message.reply('You need to join a voice channel first!');
        
        voicechannel.join().then(connection => {
            const dispatcher = connection.play(`${__dirname}/../../homer.mp3`)
            message.react('✅')
            dispatcher.on("close", close => {
                voicechannel.leave()
            })
        })
    }
}