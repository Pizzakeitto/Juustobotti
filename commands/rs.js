const Api = require('node-osu/lib/Api');

module.exports = {
    name: 'rs',
    description: 'Gets recent scores',
    execute(message, args, client){
        const osu = require('node-osu')
        const osuApi = new osu.Api(process.env.OSUTOKEN, {
            notFoundAsError: true,
            completeScores: false,
            parseNumeric: false
        });
        const Discord = require('discord.js');

        var getRecent = async function (bmapid) {
            let beatmap;
            try {
                let beatmaps = await osuApi.getBeatmaps({b:bmapid});
                if (beatmaps) {
                    beatmap = beatmaps[0];
                }
            } catch (e) {
                console.error(e);
            } finally {
                return beatmap;
            }
        }

        osuApi.getUser({
            u: args[0],
            m: 0
        }).then(user => {
            message.channel.send(`Recent score for ${user.name}`)
            osuApi.getUserRecent({
                u: user.name,
                m: 0
            }).then(recent => {
                var bmapid = recent[0].beatmapId;
                var mods = recent[0].raw_mods;
                var score = recent[0].score;
                var rank = recent[0].rank;
                var combo = recent[0].maxCombo;
                var s300 = recent[0].counts['300'];
                var s100 = recent[0].counts['100'];
                var s50 = recent[0].counts['50'];
                var smiss = recent[0].counts['miss'];
                var perfect = recent[0].perfect;
                
                // The thing to calculate
                let theThing = `(${s50} * 50 + ${s100} * 100 + ${s300} * 300) / (300 * (${smiss} + ${s50} + ${s100} + ${s300})) * 100`
                var acc = eval(theThing);
                acc = acc.toFixed(2);

                // SS checker :)
                var ss = '';
                if(acc == 100) {
                    ss = 'Tuli ees SS :LETSGO:';
                } else if (perfect) {
                    ss = 'Tuli ees FC mut ei ees SS';
                } else {
                    ss = 'Ei ees SS';
                }

                // Date formatter thingy
                let date = recent[0].date;
                let [month, day, year]    = date.toLocaleString().split("/")
                let [hour, minute, second] = date.toLocaleString().split(/:| /)
                let _date = `${day}/${month}/${year}`

                console.log(`${month} ${day} ${year} ${hour} ${minute} ${second}`)

                let bmap;
                getRecent(bmapid).then((beatmap) => {
                    bmap = beatmap;
                }).finally( () => {
                    try {
                        var embed = new Discord.MessageEmbed()
                        .setColor('#FF00FF')
                        .setAuthor(`${bmap.artist} - ${bmap.title} [${bmap.version}] + ${mods}`, `https://a.ppy.sh/${user.id}`, `https://osu.ppy.sh/b/${bmapid}`)
                        .setDescription(`▸ ${rank} ▸ vitusti pp ▸ ${acc}%\n▸ ${score} ▸ ${combo}/${bmap.maxCombo} ▸ [${s300}/${s100}/${s50}/${smiss}]`)
                        .setFooter(`${ss} | at ${_date}`);
                    } catch (e) {
                        console.log(e);
                    } finally {
                        message.channel.send(embed);
                    }
                })
                
            }).catch(err => {
                message.channel.send(err);
            })
        }).catch(err => {
            message.channel.send(err);
        })
    }
}