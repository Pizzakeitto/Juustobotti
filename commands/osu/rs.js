const Discord = require('discord.js');

module.exports = {
    name: 'rs',
    description: 'Gets recent scores',
    usage: '[user]',
    execute(message = new Discord.Message, args = []){
        const mysql = require('mysql')
        const osu = require('node-osu')
        const osuApi = new osu.Api(process.env.OSUTOKEN, {
            notFoundAsError: true,
            completeScores: false,
            parseNumeric: false
        });
        const ojsama = require('ojsama')
        const fetch = require('node-fetch').default

        const dbname = 'juustobotdata';
        const {sqlconnection} = require('../../config.json')

        function query(sql, callback) {
            let con = mysql.createConnection(sqlconnection);
            
            con.connect(function (err) {
                if (err) throw err;
                con.query(sql, callback);
                con.end()
            });
        }

        async function calculatePP(bmapid) {
            var parser = new ojsama.parser();
            console.log("dog doin it")
            var osufile = '';
            fetch(`https://osu.ppy.sh/osu/${bmapid}`).then(res => res.text).then(res => osufile = res)
            console.log(osufile)
        }

        // calculatePP(164020)
        
        var getOsuUsername = (id) => {
            return new Promise(function (resolve, reject) {
                let username = undefined;

                query("SELECT osuname FROM players WHERE discordid = " + id, function (err, res, fields) {
                    try {
                        if (err) throw err;
                        username = res[0].osuname;
                    } catch (e) {
                        console.error(e)
                    } finally {
                        resolve(username); // returns undefined if not found
                    }
                })
            });
        }

        var getRecentBeatmap = async function (bmapid) {
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

        getOsuUsername(message.author.id).then(username => {
            console.log(`yeah username here is ${username}`)
            if(args[0] == undefined || null){
                //No arguments given
                if (username != null || undefined) {
                    // message.channel.send(`Your osuname is ${username} right? (If not blame Pizzakeitto)`);
                } else {
                    return message.channel.send(`You ain't linked bruh (do ju!link <username>)`);
                }
            } else { username = args[0]; }

            osuApi.getUser({
                u: username,
                m: 0
            }).then(user => {
                // message.channel.send(`Recent score for ${user.name}`)
                osuApi.getUserRecent({
                    u: user.name,
                    m: 0
                }).then(recent => {
                    let a = args[1] ? args[1] : 0;
                    var bmapid =   recent[a].beatmapId;
                    console.log()
                    var mods =     recent[a].raw_mods;
                    var score =    recent[a].score;
                    var rank =     recent[a].rank;
                    var combo =    recent[a].maxCombo;
                    var s300 =     recent[a].counts['300'];
                    var s100 =     recent[a].counts['100'];
                    var s50 =      recent[a].counts['50'];
                    var smiss =    recent[a].counts['miss'];
                    var perfect =  recent[a].perfect;
                    var counts = Number(s300) + Number(s100) + Number(s50) + Number(smiss);
                    
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
                    let date = recent[a].date;
                    let [month, day, year]    = date.toLocaleString().split("/")
                    let [hour, minute, second] = date.toLocaleString().split(/:| /)
                    let _date = `${day}/${month}/${year}`
    
                    // console.log(`${month} ${day} ${year} ${hour} ${minute} ${second}`)
    
                    let bmap;
                    getRecentBeatmap(bmapid).then((beatmap) => {
                        bmap = beatmap;
                    }).finally( () => {
                        try {
                            var objects = Number(bmap.objects.normal) + Number(bmap.objects.slider) + Number(bmap.objects.spinner);
                            var completionMath = `(${counts} / ${objects}) * 100`
                            var completion = eval(completionMath).toFixed(2);
                            var embed = new Discord.MessageEmbed()
                            .setColor('#FF00FF')
                            .setAuthor(`${bmap.artist} - ${bmap.title} [${bmap.version}]`, `https://a.ppy.sh/${user.id}`, `https://osu.ppy.sh/b/${bmapid}`)
                            .setThumbnail(`https://b.ppy.sh/thumb/${bmap.beatmapSetId}l.jpg`)
                            .setDescription(`▸ ${rank} ▸ vitusti pp ▸ ${acc}%\n▸ ${score} ▸ ${combo}/${bmap.maxCombo} ▸ [${s300}/${s100}/${s50}/${smiss}]`)
                            .setFooter(`${ss} • ${completion}% completion`)
                        } catch (e) {
                            console.log(e);
                        } finally {
                            message.channel.send(`Recent score for ${user.name} <t:${date.getTime()/1000}:R>`, {embed: embed})
                        }
                    })
                    
                }).catch(err => {
                    message.channel.send(err);
                })
            }).catch(err => {
                message.channel.send(err);
            })
            
        })
    }
}
