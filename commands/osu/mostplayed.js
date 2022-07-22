const Discord = require('discord.js')

module.exports = {
    name: 'mp',
    description: 'Gets most played maps',
    detailedDescription: 'You can find out the most played maps for someone. If you link your account (using ju!link) you don\'t have to type your username to get your profile.',
    usage: 'mp <user>',
    execute(message = Discord.Message.prototype, args = []){
        const osu = require('node-osu')
        const axios = require('axios').default
        const { getosuUser } = require('../../utils/osuUtils.js')
        
        const osuApi = new osu.Api(process.env.OSUTOKEN, {
            notFoundAsError: true,
            completeScores: false,
            parseNumeric: false
        })
        const dbname = 'juustobotdata'
        const {sqlconnection} = require('../../config.json')

        main()
        
        async function main() {
            let osuUserName;

            // If no arguments, check in with the database
            if (args.length == 0) {
                osuUserName = await getosuUser(message.author.id).catch(err => {
                    console.log(err)
                    message.channel.send("Sometihg brok!")
                })
            } else osuUserName = args[0]

            const user = await osuApi.getUser({u: osuUserName})
            .catch(err => {
                if (err.message == 'Not found') message.channel.send("User was not found!")
                else {
                    console.error(err)
                    message.channel.send("Something unexpected happened!")
                }
            })

            if (user) {
                let offset = 0
                let endpoint = `https://osu.ppy.sh/users/_id/beatmapsets/most_played?limit=5&offset=_y`
                endpoint = endpoint.replace("_id", user.id).replace("_y", offset)

                const response = await axios(endpoint)
                const mostPlayed = response.data // Most played maps in an array

                let embeds = []
                mostPlayed.forEach(beatmap => {
                    const embed = new Discord.MessageEmbed()
                    embed.setDescription(`${offset + 1}. **${beatmap.count}** plays on ${beatmap.beatmapset.artist} - ${beatmap.beatmapset.title} [${beatmap.beatmap.version}]` + 
                                    `\nMapped by ${beatmap.beatmapset.creator} | [Link](https://osu.ppy.sh/b/${beatmap.beatmap_id})`)
                    embed.setAuthor({iconURL: beatmap.beatmapset.covers.list, name: `${beatmap.beatmapset.title} [${beatmap.beatmap.version}]`})
                    offset ++
                    embeds.push(embed)
                })
                offset ++ // here it should be equal to 5
                let botmsg = await message.channel.send({content: `Most played maps for ${user.name}`, embeds: embeds})
                // :rewind::arrow_left::arrow_right::fast_forward:
                // await botmsg.react(":rewind:")
                // await botmsg.react(":arrow_left:")
                // await botmsg.react(":arrow_right:")
                // await botmsg.react(":fast_forward:")
                
            } else {
                message.channel.send("Something really unexpected happened!")
                console.error("osu api didnt find an user? tried looking for " + osuUserName)
            }
            
        }
    }
}