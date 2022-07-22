const Discord = require('discord.js')
const fs = require('fs')
const Danser = require('node-danser')
const https = require('https')
const {v2, auth} = require('osu-api-extended')
const { OSUCLIENTID, OSUCLIENTSECRET } = process.env
const { ScoreDecoder } = require('osu-parsers')
const cp = require('child_process')

//import Danser from "node-danser/utils/Danser"


module.exports = {
    name: 'render',
    description: 'Render an osu! replay',
    detailedDescription: 'With this command you can get a video file of your replay! do `ju!replay` and attach the file, and ill do the heavylifting.',
    usage: 'rs <user>',
    execute(message = Discord.Message.prototype, args = [""]){
        /**
         * Alr first
         * 1. get the replay file from dude
         * 2. get the map id from the replay using 'osu-parsers'
         * 3. use the id to download the map from osu using https://github.com/cyperdark/osu-api-extended/wiki/v2.beatmap.download
         * 4. get user preferences (skin, bg dim, quickstart or no quickstart)
         * 5. render using all of this
         * 6. send rendered video (also progress?)
         */
        return message.reply("wip lol")
        const danserDir = process.cwd() + "/danser_data"
        if(!fs.existsSync(danserDir)) fs.mkdirSync(danserDir)
        const songsDir = danserDir + "/songs"
        if(!fs.existsSync(songsDir)) fs.mkdirSync(songsDir)
        const skinsDir = danserDir + "/skins"
        if(!fs.existsSync(skinsDir)) fs.mkdirSync(skinsDir)
        const videosDir = danserDir + "/videos"
        if(!fs.existsSync(videosDir)) fs.mkdirSync(videosDir)


        const danserclient = new Danser({
            SongsDir: songsDir,
            SkinsDir: skinsDir,
        })
        const options = new Danser.Options();
        options.enableRecord(videosDir)
        danserclient.setOptions(options)


        const msgAttachment = message.attachments.first()
        // msgAttachment.attachment = url to the file in the cdn
        // https://cdn.discordapp.com/attachments/733451782587416648/979058468340244480/soppa_-_Renard_-_You_Goddamn_Fish_Extreme_2022-05-25_Osu.osr
        if (msgAttachment == undefined ) return message.reply("You need to attach a replay file!")
        if (!msgAttachment.attachment.endsWith(".osr")) return message.reply("This is not an osu! replay file! (they end with an .osr)")

        doTheThingsThatNeedToBeDone()
        // lets go to async because yay
        async function doTheThingsThatNeedToBeDone(){
            const replayFilePath = `${danserDir}/${message.author.id}.osr`
            const replayRequest = await download(msgAttachment.attachment, replayFilePath)
            console.log("Should be done downloading?")
            
            const replayDecoder = new ScoreDecoder();
            const replay = await replayDecoder.decodeFromPath(replayFilePath)
            console.log(replay)

            await auth.login(OSUCLIENTID, OSUCLIENTSECRET)
            const map = await v2.beatmap.lookup.diff({checksum: replay.info.beatmapHashMD5})
            const beatmapPath = `${songsDir}/${map.beatmapset_id}.osz`
            // await download(`https://beatconnect.io/b/${map.beatmapset_id}/`, beatmapPath)
            console.log("downloaded map")
            
            //cp.execSync(`cd ${songsDir}; mkdir -p ${map.beatmapset_id}; unzip -n -q ${beatmapPath} -d ./${map.beatmapset_id};`)
            //fs.rmSync(beatmapPath)

            const danserMap = new Danser.Beatmap();
            danserMap.setID(map.id)
            danserclient.setBeatmap(map)
            
            const clientData = await danserclient.start()
            console.log(clientData)
            console.log("Rendered?")
        }


        async function download(url, path) {
            return new Promise(function(resolve, reject) {
                https.get(url, {timeout: 60000} , (res) => {
                    const file = fs.createWriteStream(path)
                    res.pipe(file)
                    file.on('finish', () => {
                        file.close()
                        console.log("Done downloading")
                        resolve()
                    })
                })
                
            })
        }
    }
}