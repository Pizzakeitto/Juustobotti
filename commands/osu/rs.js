const Discord = require('discord.js')

module.exports = {
    name: 'rs',
    description: 'Gets recent scores',
    detailedDescription: 'Get the most recent play from someone. If you link your account (using ju!link) you don\'t have to type your username to get your profile.',
    usage: 'rs <user>',
    execute(message = Discord.Message.prototype, args = [""]){
        const { v2, auth, tools, mods } = require('osu-api-extended')
        const { getosuUser, wysi, rankToEmoji } = require('../../utils/osuUtils')
        const { numberWithCommas } = require('../../utils/numUtils')
        const { OSUCLIENTID, OSUCLIENTSECRET } = process.env

        // Similar start to osu.js ...
        if (args.length == 0) {
            getosuUser(message.author.id, true).then(user => recentScore(user.id))
        } else if (isNaN(args.join(' '))) getosuId(args.join(' '))
        else recentScore(args.join(' '))

        // Gotta do this because for some reason the api v2 users scores thing neeeds id instead of username,,,.,,.,.,.,.,.,.,..,.,,.
        async function getosuId(username) {
            message.channel.sendTyping()
            console.log("getting id")
            await auth.login(OSUCLIENTID, OSUCLIENTSECRET)
            const user = await v2.user.get(args.join(' '), "osu")
            recentScore(user.id)
        }

        async function recentScore(osuID) {
            message.channel.sendTyping()
            const { access_token } = await auth.login(OSUCLIENTID, OSUCLIENTSECRET) // Need to get the token outta here so can do custom calls
            console.log("ait checking for " + osuID)
            const recent = await v2.scores.users.recent(osuID, {mode: "osu", limit: 1, include_fails: 1})
            // .catch(err => {
            //     console.error(err)
            //     return
            // })
            if (recent.length == 0) return message.channel.send(`No recent scores found!`)
            const mostRecent = recent[0]
            
            const bmapid =      mostRecent.beatmap.id
            const bmapsetid =   mostRecent.beatmapset.id
            const artist =      mostRecent.beatmapset.artist
            const title =       mostRecent.beatmapset.title
            const version =     mostRecent.beatmap.version
            let rating = ""
            if (mostRecent.mods.length == 0) rating = `${mostRecent.beatmap.difficulty_rating.toFixed(2)} ⭐`
            else {
                let attributes = await require('axios').default.post(`https://osu.ppy.sh/api/v2/beatmaps/${bmapid}/attributes`, {
                    "mods": mostRecent.mods
                }, {
                    headers: {
                        "Content-Type": "application/json",
                        "accept": "application/json",
                        "Authorization": `Bearer ${access_token}`
                    }
                })
                rating = attributes.data.attributes.star_rating.toFixed(2) + " ⭐"
            }
            // Going to use this attributes thing for max_combo too as soon as it starts working,,
            // https://github.com/ppy/osu-web/issues/8755

            const mods =        mostRecent.mods.length == 0 ? "Nomod" : mostRecent.mods.join('')
            const score =       numberWithCommas(mostRecent.score)
            const rank =        rankToEmoji(mostRecent.rank)
            const combo =       mostRecent.max_combo // max combo the player was able to achieve
            const acc =         (mostRecent.accuracy * 100).toFixed(2)
            const pp =          mostRecent.pp

            // https://github.com/ppy/osu-api/issues/104
            // Iguess ill have to get the beatmaps max combo myself,,,
            // This sucks because it will take longer to respond..
            // Could replace with https://osu.ppy.sh/docs/index.html#get-beatmap-attributes
            const additionalstuff = await v2.beatmap.get(bmapid)
            const maxcombo =    additionalstuff.max_combo

            const s300 =        mostRecent.statistics.count_300
            const s100 =        mostRecent.statistics.count_100
            const s50 =         mostRecent.statistics.count_50
            const smiss =       mostRecent.statistics.count_miss
            const counts =      s300 + s100 + s50 + smiss
            const objects =     mostRecent.beatmap.count_circles + mostRecent.beatmap.count_sliders + mostRecent.beatmap.count_spinners
            const completion = ((counts / objects) * 100).toFixed(0) // should return 37 for example if the player managed to play 37% of the map
            const perfect =     mostRecent.perfect

            let wysifiedCounts = wysi(`${s300}/${s100}/${s50}/${smiss}`)
            // SS checker :)
            let ss = ''
            if(acc == 100) {
                ss = 'Tuli ees SS :LETSGO:'
            } else if (perfect) {
                ss = 'Tuli ees FC mut ei ees SS'
            } else {
                ss = 'Ei ees SS'
            }
            
            // pretty much yoinked the old embed
            let embed = new Discord.MessageEmbed()
            .setColor('#FF00FF')
            .setAuthor({ name: `${artist} - ${title} [${version}] | ${rating}`, url: `https://osu.ppy.sh/b/${bmapid}`, iconURL: `https://a.ppy.sh/${osuID}` })
            .setThumbnail(`https://b.ppy.sh/thumb/${bmapsetid}l.jpg`)
            .setDescription(`▸ ${rank} ▸ ${mods} ▸ ${wysi(acc)}% ${pp != null ? `, ${pp.toFixed(0)}pp` : ''}\n▸ ${wysi(score)} ▸ ${wysi(combo)}/${wysi(maxcombo)} ▸ [${wysifiedCounts}]`)
            .setFooter({text: `${ss} • ${completion}% completion`})
            message.channel.send({content: `The most recent play for ${mostRecent.user.username} <t:${new Date(mostRecent.created_at).valueOf()/1000}:R>:`, embeds: [embed]})
        }

        // I intended to use this for pp calculation stuff but turns out the pp calculator that comes with osu-api-extended is brokie.
        // Anyway uh it takes an array of mods as input and converts it into an integer
        function multipleModsToID(modsToParse = [""]) {
            let multipleModsID = 0
            modsToParse.forEach(mod => {
                multipleModsID += mods.id(mod)
            })
            return multipleModsID
        }
    }
}
