const Discord = require('discord.js');

module.exports = {
    name: 'homer',
    description: 'homer',
    execute(message = new Discord.Message, args = [""]) {
        const voicechannel = message.member.voice.channel
        if (voicechannel) {
            voicechannel.join().then(connection => {
                const dispatcher = connection.play(`${__dirname}/../../homer.wav`)
                dispatcher.on("close", close => {
                    voicechannel.leave()
                })
            })
          } else {
            message.reply('You need to join a voice channel first!');
          }
    }
}