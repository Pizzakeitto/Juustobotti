const Discord = require('discord.js')
module.exports = {
    name: 'osu',
    aliases: ['profile'],
    description: 'Gets user info',
    detailedDescription: 'Get info about someone on osu! Use `-s` to get a shorter version of your profile. If you link your account (using ju!link) you don\'t have to type your username to get your profile.',
    usage: 'osu [-s] <user>',
    execute(message = Discord.Message.prototype, args = [""]){
        const { v2, auth } = require('osu-api-extended')
        const { wysi, getosuUser } = require('../../utils/osuUtils')
        const { numberWithCommas } = require('../../utils/numUtils')
        const { OSUCLIENTID, OSUCLIENTSECRET } = process.env

        let shortmode = false

        if (args[0] == "-s") {
            shortmode = true
            args.shift()
        }

        // First lets check if there is any user specified, so we can check the database just in case we need
        if (args.length == 0) {
            // check db
            getosuUser(message.author.id).then(username => osuProfil(username))
            .catch(err => {
                if(err == "Not in database!") return message.channel.send("Sorry I dont know who you are. Do `ju!link <your osu name>` to link your Discord with your osu account.")
                // else
                message.channel.send('Something unexpected happened!')
                console.log(err)
            })
        } else osuProfil(args.join(' '))

        async function osuProfil(username = "") {
            await auth.login(OSUCLIENTID, OSUCLIENTSECRET)

            const profile = await v2.user.details(username, "osu", "username")
            if (Object.getOwnPropertyNames(profile).includes("error")) {
                console.log("Error: couldnt find user")
                message.reply({content: "Couldn't find this user! (or something broke)", allowedMentions: {repliedUser: false}})
                return
            }

            const name = profile.username
            const id = profile.id
            const playtime = (profile.statistics.play_time / 3600).toFixed(1) // From seconds to hours
            const rank = wysi(numberWithCommas(profile.statistics.global_rank))
            const pp = wysi(profile.statistics.pp)
            const level = `${profile.statistics.level.current} (${profile.statistics.level.progress}%)`
            const acc = wysi(profile.statistics.hit_accuracy.toFixed(2))
            const playcount = wysi(numberWithCommas(profile.statistics.play_count))
            
            const rankedScore = wysi(numberWithCommas(profile.statistics.ranked_score))
            const totalScore = wysi(numberWithCommas(profile.statistics.total_score))
            const SS = wysi(profile.statistics.grade_counts.ss + profile.statistics.grade_counts.ssh)
            const S = wysi(profile.statistics.grade_counts.s + profile.statistics.grade_counts.sh)
            const A = wysi(profile.statistics.grade_counts.a)

            const embed = new Discord.EmbedBuilder
            // These things are the same for both embed types
            embed.setColor('#FF66AA') // osu
            embed.setAuthor({name: `Profile for ${name}`, iconURL: `https://pizzakeitto.xyz/flags/flags-iso/shiny/32/${profile.country_code}.png` /* thank https://github.com/ebenh/flags */, url: `https://osu.ppy.sh/users/${id}`})
            embed.setThumbnail(`http://s.ppy.sh/a/${id}`)
            if (shortmode) {
                // insert shortened embed here.
                embed.setDescription(
                    `▸ **Rank:** ${rank} (#${profile.country_code} ${wysi(numberWithCommas(profile.statistics.country_rank))})\n` +
                    `▸ **PP:** ${pp}\n` +
                    `▸ **Accuracy:** ${acc}%\n` +
                    `▸ **Playcount:** ${playcount}\n` 
                )
                .setFooter({text: `Playtime: ${wysi(playtime)}h`})
                .setTimestamp(Date.parse(profile.join_date))
            } else {
                embed.addFields({
                name: "- Performance -",
                value:  `**Rank**: ${rank} (#${profile.country_code} ${wysi(numberWithCommas(profile.statistics.country_rank))})` +
                        `\n**PP**: ${pp}` +
                        `\n**Level**: ${level}` +
                        `\n**Accuracy**: ${acc}%` +
                        `\n**Playcount**: ${playcount}`, 
                inline: true
                },

                {
                name:   "- Score -",
                value:  `**Ranked score**: ${rankedScore}` +
                        `\n**Total score**: ${totalScore}` +
                        `\n**SS**: ${SS}` +
                        `\n**S**: ${S}` +
                        `\n**A**: ${A}`,
                inline: true
                })
                .setFooter({text: `ID: ${wysi(id)} • Playtime: ${wysi(playtime)}h`})
                .setTimestamp(Date.parse(profile.join_date))
            }

            message.channel.send({content: 'Nice profile bro!', embeds: [embed]})
        }
    }
}