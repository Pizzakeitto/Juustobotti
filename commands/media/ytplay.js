const Discord = require('discord.js');
const ytdl = require('ytdl-core')
const axios = require('axios').default

module.exports = {
    name: 'play',
    description: 'Play a vid from youtube!!!',
    execute(message = new Discord.Message, args = [""]) {
        // if (args[0] == undefined) return message.reply('Gimie url!!!')

        const voicechannel = message.member.voice.channel
        if (!voicechannel) return message.reply('You need to join a voice channel first!')

        // Check if the wanted video is a link or search query
        // Credits to https://stackoverflow.com/a/37704433 !!!
        const urlRegex = /^((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube\.com|youtu.be))(\/(?:[\w\-]+\?v=|embed\/|v\/)?)([\w\-]+)(\S+)?$/

        let ytvid = ""
        if (urlRegex.test(args[0])) {
            ytvid = ytdl(args[0], {filter: "audioonly"})
        } else {
            // Time to play with the yt api
            axios.get('https://www.googleapis.com/youtube/v3/search', { 
                params: { 
                    key: process.env.YTAPIKEY,
                    q: args.join(" "),
                    type: "video",
                    maxResults: 1,
                }
            }).then(res => {
                console.log(`Got a response from yt saying ${res.status}, ${res.statusText}`)
                console.log(res.data)
                if (res.data.items.length == 0) return message.channel.send('YT said not found?')
                let vidurl = "https://youtu.be/" + res.data.items[0].id.videoId
                console.log(vidurl)
                ytvid = ytdl(vidurl, {filter: "audioonly"})
            }).catch(err => {
                console.error(err)
            })
        }

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
    }
}