const Discord = require('discord.js');
// const ytdl = require('ytdl-core')
const ytdl = require('ytdl-core-discord')
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

        let ytvid
        let isUrl
        let vidUrl
        let isAttachment

        main()
        
        async function main() {
            // Put everything here
            if (urlRegex.test(args[0])) {
                vidUrl = args[0]
                isUrl = false
            } else if (message.attachments.size >= 1){
                isUrl = false
                isAttachment = true
            } else {
                isUrl = true
                // Time to play with the yt api
                let res = await axios.get('https://www.googleapis.com/youtube/v3/search', { 
                    params: { 
                        key: process.env.YTAPIKEY,
                        q: args.join(" "),
                        type: "video",
                        maxResults: 1,
                    }
                })
                console.log(`Got a response from yt saying ${res.status}, ${res.statusText}`)
                console.log(res.data)
                if (res.data.items.length == 0) return message.channel.send('YT said not found?')
                vidUrl = "https://www.youtube.com/watch?v=" + res.data.items[0].id.videoId
                console.log(vidUrl)
            }
    
            // Join the vc
    
            let connection = await voicechannel.join()
            if (process.env.WaitInChannel != undefined) clearTimeout(process.env.WaitInChannel)
            if (isUrl) {
                message.channel.send(`Now playing: \n\n${vidUrl}`)
            }
            await message.react('✅')
            if (isAttachment) {
                playFile(connection)
            } else {
                // Start playing the stream
                play(connection)
            }

            async function play (connection) {
                ytvid = await ytdl(vidUrl)
                const dispatcher = connection.play(ytvid, { type: 'opus' })
                dispatcher.on("finish", () => {
                    if (message.guild.voice.connection.loop) {
                        play(connection)
                    } else {
                        // process.env.WaitInChannel = setTimeout( function () {
                            // voicechannel.leave()
                            // message.channel.send('Left voice due to inactivity 💀')
                            // Would have left but doesnt work correctly lol
                        // }, 30 * 1000 * 60 /* 30 minutes */)
                    }
                })
            }

            function playFile (connection) {
                const dispatcher = connection.play(message.attachments.first().attachment)
                if (message.guild.voice.connection.loop) {
                    playFile(connection)
                }
            }
        }
    }
}