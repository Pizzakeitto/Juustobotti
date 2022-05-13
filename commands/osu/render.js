const Discord = require('discord.js')
//import Danser from "node-danser/utils/Danser"


module.exports = {
    name: 'render',
    description: 'Render an osu! replay',
    detailedDescription: 'With this command you can get a video file of your replay! do `ju!replay` and attach the file, and ill do the heavylifting.',
    usage: 'rs <user>',
    execute(message = Discord.Message.prototype, args = [""]){
        return message.channel.send("wip lol")
        const axios = require('axios').default
        const cp = require('child_process')
        const danserclient = new Danser
        danserclient.options.enableRecord()

        const replay = message.attachments.first()
        if (replay == undefined ) return message.reply("You need to attach a replay file!")
        console.log(replay.attachment.endsWith(".osr"))
    }
}