const Discord = require('discord.js');
const ytdl = require('ytdl-core')

module.exports = {
    name: 'play',
    description: 'Play a vid from youtube!!!',
    execute(message = new Discord.Message, args = [""]) {
        if (args[0] == undefined) return message.reply('Gimie url!!!')

        const voicechannel = message.member.voice.channel
        if (voicechannel) {
            // Download youtube video to a buffer/stream idk
            let ytvid = ytdl(args[0], {filter: "audioonly"})

            // Join the vc
            voicechannel.join().then(connection => {
                message.react('✅')
                // Start playing the stream
                const dispatcher = connection.play(ytvid)
                dispatcher.on("close", close => {
                    // voicechannel.leave()
                })

                dispatcher.on("finish", finish => {
                    voicechannel.leave() // When song done, leave
                })
            }).catch(err => {
                message.reply('Cant join vc?')
            })

            
        } else {
            message.reply('You need to join a voice channel first!');
        }
    }
}