const Discord = require('discord.js')

module.exports = {
    name: 'recent',
    aliases: ['rs', 'r'],
    description: 'Gets recent scores',
    detailedDescription: 'Get the most recent play from someone. If you link your account (using ju!link) you don\'t have to type your username to get your profile.',
    usage: 'recent <user>',
    execute(message = Discord.Message.prototype, args = [""]){
        const { v2, auth, tools, mods } = require('osu-api-extended')
        const { getosuUser, wysi, rankToEmoji } = require('../../utils/osuUtils')
        const { numberWithCommas } = require('../../utils/numUtils')
        const { OSUCLIENTID, OSUCLIENTSECRET } = process.env

        // Similar start to osu.js ...
        if (args.length == 0) {
            getosuUser(message.author.id, true).then(user => recentScore(user.id))
            .catch(err => {
                if(err == "Not in database!") return message.channel.send("Sorry idk who you are, please specify some user (like ju!rs cookiezi) or do ju!link first!:!.!")
                // Else
                message.channel.send('Something unexpected happened!')
                console.log(err)
            })
        } else if (isNaN(args.join(' '))) getosuId(args.join(' '))
        else recentScore(args.join(' '))

        // Gotta do this because for some reason the api v2 users scores thing neeeds id instead of username,,,.,,.,.,.,.,.,.,..,.,,.
        async function getosuId(username) {
            message.channel.sendTyping()
            console.log("getting id")
            await auth.login(OSUCLIENTID, OSUCLIENTSECRET)
            const user = await v2.user.details(args.join(' '), "osu")
            recentScore(user.id)
        }

        async function recentScore(osuID) {
            message.channel.sendTyping()
            const { access_token } = await auth.login(OSUCLIENTID, OSUCLIENTSECRET) // Need to get the token outta here so can do custom calls
            console.log("ait checking for " + osuID)
            const recent = await v2.user.scores.category(osuID, "recent", {include_fails: 1, limit: 1, mode: "osu"})
            if (recent.length == 0) return message.channel.send(`No scores found within the last 24 hours!`)
            const mostRecent = recent[0]

            const bmapid =      mostRecent.beatmap.id
            const bmapsetid =   mostRecent.beatmapset.id
            const artist =      mostRecent.beatmapset.artist
            const title =       mostRecent.beatmapset.title
            const version =     mostRecent.beatmap.version

            const {attributes} = await v2.beatmap.attributes(bmapid, { mods: mostRecent.mods })
            if (attributes) {
                var rating =      attributes.star_rating.toFixed(2) + " ⭐"
                var maxcombo =    attributes.max_combo
            } else {
                var rating = "idk ⭐"
                var maxcombo = "idk"
            }

            const mods =        mostRecent.mods.length == 0 ? "Nomod" : mostRecent.mods.join('')
            const score =       numberWithCommas(mostRecent.score)
            const rank =        rankToEmoji(mostRecent.rank)
            const combo =       mostRecent.max_combo // max combo the player was able to achieve
            const acc =         (mostRecent.accuracy * 100).toFixed(2)
            const pp =          mostRecent.pp

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
            let embed = new Discord.EmbedBuilder()
            .setColor('#FF66AA')
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
