// NOTE: DISABLED BECAUSE DEALING WITH AUDIO SUCKS ON DISCORD.JS AND I DONT WANT TO TOUCH THIS ANYMORE
// Feel free to rewrite and make pr :)



const Discord = require('discord.js')
const ytdl = require('ytdl-core')
const axios = require('axios').default
const voice = require('@discordjs/voice')

module.exports = {
    name: 'play',
    description: 'Play a vid from youtube!!!',
    execute(message = Discord.Message.prototype, args = []) {
        if (args.length == 0) return message.reply('Gimie a link OR something to search for!')

        const voicechannel = message.member.voice.channel
        console.log(voicechannel)
        if (!voicechannel) return message.reply('You need to join a voice channel first!')

        // const ytcog = require('ytcog')

        // async function getAudioStream(vid = "") {
        //     // This function gets the raw audio of the youtube video
        //     const videoId = ytdl.getVideoID(vid)
 
        //     const session = new ytcog.Session()
        //     await session.fetch()
        //     console.log(session.status)
        //     if(session.status == 'OK') {
        //         const video = new ytcog.Video(session, {
        //             id: videoId,
        //             container: 'webm',
        //             videoQuality: 'none',
        //             audioQuality: 'highest'
        //         })

        //         await video.fetch()
        //         return video.audioStreams[0].url
        //     }
        // }

        const connection = voice.joinVoiceChannel({
            channelId: voicechannel.id,
            guildId: voicechannel.guildId,
            adapterCreator: voicechannel.guild.voiceAdapterCreator
        })

        const audioPlayer = voice.createAudioPlayer()

        // Check if the wanted video is a link or search query
        // Credits to https://stackoverflow.com/a/37704433 !!!
        const urlRegex = /^((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube\.com|youtu.be))(\/(?:[\w\-]+\?v=|embed\/|v\/)?)([\w\-]+)(\S+)?$/

        let isUrl
        let vidUrl
        let isAttachment


        // This stuff dedicated to checking if argument is an url or a search query
        if (urlRegex.test(args[0])) {
            vidUrl = args[0]
            isUrl = true
            play(vidUrl)
        } else if (message.attachments.size >= 1){
            isUrl = false
            isAttachment = true
        } else {
            isUrl = true
            // Time to play with the yt api
            axios.get('https://www.googleapis.com/youtube/v3/search', { 
                params: { 
                    key: process.env.YTAPIKEY,
                    q: args.join(" "),
                    type: "video",
                    maxResults: 1,
                }
            })
            .then(res => {
                console.log(`Got a response from yt saying ${res.status}, ${res.statusText}`)
                console.log(res.data)
                if (res.data.items.length == 0) return message.channel.send('YT said not found?')
                vidUrl = "https://www.youtube.com/watch?v=" + res.data.items[0].id.videoId
                console.log(vidUrl)
                play(vidUrl)
            })
            .catch(err => {
                console.log(err)
                message.channel.send("There was an error trying to search for the video!! sorry mate")
                return
            })
        }

        
        async function play(vidUrl = "") {
            const stream = ytdl(vidUrl, {quality: "highestaudio"})
            const resource = voice.createAudioResource(stream)

            audioPlayer.play(resource)
            message.react('✅')
            message.channel.send(`Now playing: \n\n${vidUrl}`)
            const subscription = connection.subscribe(audioPlayer)
        }
        
        audioPlayer.on('error', err => {
            console.log(err)
        })

        audioPlayer.on(voice.AudioPlayerStatus.Idle, () => {
            if(message.guild.me.voice.channel.loop) {
                play(vidUrl)
            }
        })


        // // Check if the wanted video is a link or search query
        // // Credits to https://stackoverflow.com/a/37704433 !!!
        // const urlRegex = /^((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube\.com|youtu.be))(\/(?:[\w\-]+\?v=|embed\/|v\/)?)([\w\-]+)(\S+)?$/

        // let ytvid
        // let isUrl
        // let vidUrl
        // let isAttachment

        // main()
        
        // async function main() {
        //     // Put everything here
        //     if (urlRegex.test(args[0])) {
        //         vidUrl = args[0]
        //         isUrl = false
        //     } else if (message.attachments.size >= 1){
        //         isUrl = false
        //         isAttachment = true
        //     } else {
        //         isUrl = true
        //         // Time to play with the yt api
        //         let res = await axios.get('https://www.googleapis.com/youtube/v3/search', { 
        //             params: { 
        //                 key: process.env.YTAPIKEY,
        //                 q: args.join(" "),
        //                 type: "video",
        //                 maxResults: 1,
        //             }
        //         }).catch(err => {
        //             console.log(err)
        //             message.channel.send("There was an error trying to download the video!! sorry mate")
        //             return
        //         })
        //         console.log(`Got a response from yt saying ${res.status}, ${res.statusText}`)
        //         console.log(res.data)
        //         if (res.data.items.length == 0) return message.channel.send('YT said not found?')
        //         vidUrl = "https://www.youtube.com/watch?v=" + res.data.items[0].id.videoId
        //         console.log(vidUrl)
        //     }
    
        //     // Join the vc
    
        //     let connection = await voicechannel.join()
        //     if (process.env.WaitInChannel != undefined) clearTimeout(process.env.WaitInChannel)
        //     if (isUrl) {
        //         message.channel.send(`Now playing: \n\n${vidUrl}`)
        //     }
        //     await message.react('✅')
        //     if (isAttachment) {
        //         playFile(connection)
        //     } else {
        //         // Start playing the stream
        //         play(connection)
        //     }

        //     async function play (connection) {
        //         ytvid = await ytdl(vidUrl)
        //         const dispatcher = connection.play(ytvid, { type: 'opus' })
        //         dispatcher.on("finish", () => {
        //             if (message.guild.voice.connection.loop) {
        //                 play(connection)
        //             } else {
        //                 // process.env.WaitInChannel = setTimeout( function () {
        //                     // voicechannel.leave()
        //                     // message.channel.send('Left voice due to inactivity 💀')
        //                     // Would have left but doesnt work correctly lol
        //                 // }, 30 * 1000 * 60 /* 30 minutes */)
        //             }
        //         })
        //     }

        //     function playFile (connection) {
        //         const dispatcher = connection.play(message.attachments.first().attachment)
        //         if (message.guild.voice.connection.loop) {
        //             playFile(connection)
        //         }
        //     }
        // }
    }
}