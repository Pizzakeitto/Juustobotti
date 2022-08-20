const Discord = require('discord.js')

module.exports = {
    name: 'rs',
    description: 'Gets recent scores',
    detailedDescription: 'Get the most recent play from someone. If you link your account (using ju!link) you don\'t have to type your username to get your profile.',
    usage: 'rs <user>',
    execute(message = new Discord.Message, args = []){
        const mysql = require('mysql')
        const osu = require('node-osu')
        const osuApi = new osu.Api(process.env.OSUTOKEN, {
            notFoundAsError: true,
            completeScores: false,
            parseNumeric: false
        })

        const dbname = 'juustobotdata'
        const {sqlconnection} = require('../../config.json')

        function query(sql, callback) {
            let con = mysql.createConnection(sqlconnection)
            
            con.connect(function (err) {
                if (err) throw err
                con.query(sql, callback)
                con.end()
            })
        }

        function numberWithCommas(x) {
            try {return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            catch(error) {
                console.error("Failed formatting the number, maybe user doesnt exist?")
                return x
            }
        }

        // calculatePP(164020)
        
        let getOsuUsername = (id) => {
            return new Promise(function (resolve, reject) {
                let username = undefined

                query("SELECT osuname FROM players WHERE discordid = " + id, function (err, res, fields) {
                    try {
                        if (err) throw err
                        username = res[0].osuname
                    } catch (e) {
                        console.error(e)
                    } finally {
                        resolve(username) // returns undefined if not found
                    }
                })
            })
        }

        async function getRecentBeatmap (bmapid, mods){
            let beatmap
            try {
                let beatmaps = await osuApi.getBeatmaps({b:bmapid, mods: mods})
                if (beatmaps) {
                    beatmap = beatmaps[0]
                }
            } catch (e) {
                console.error(e)
            } finally {
                return beatmap
            }
        }

        function parseMods(mods = []) {
            let parsedMods = ''
            mods.forEach(mod => {
                switch (mod) {
                    case 'None':
                        parsedMods += 'Nomod'
                        break
                    case 'NoFail':
                        parsedMods += 'NF'
                        break
                    case 'Easy':
                        parsedMods += 'EZ'
                        break
                    case 'TouchDevice':
                        parsedMods += 'TD'
                        break
                    case 'Hidden':
                        parsedMods += 'HD'
                        break
                    case 'HardRock':
                        parsedMods += 'HR'
                        break
                    case 'SuddenDeath':
                        parsedMods += 'SD'
                        break
                    case 'DoubleTime':
                        parsedMods += 'DT'
                        break
                    case 'Relax':
                        parsedMods += 'RX'
                        break
                    case 'HalfTime':
                        parsedMods += 'HT'
                        break
                    case 'Nightcore':
                        parsedMods += 'NC'
                        break
                    case 'Flashlight':
                        parsedMods += 'FL'
                        break
                    case 'Autoplay':
                        parsedMods += 'Autoplay?'
                        break
                    case 'SpunOut':
                        parsedMods += 'SO'
                        break
                    case 'Relax2':
                        parsedMods += 'AP'
                        break
                    case 'Perfect':
                        parsedMods += 'PF'
                        break
                    case 'ScoreV2':
                        parsedMods += 'SV2'
                        break
                    default:
                        break
                }

            })

            if(parsedMods != '') return parsedMods
            else return 'Nomod'
        }

        getOsuUsername(message.author.id).then(username => {
            console.log(`yeah username here is ${username}`)
            if(args[0] == undefined || null){
                //No arguments given
                if (username != null || undefined) {
                    // message.channel.send(`Your osuname is ${username} right? (If not blame Pizzakeitto)`)
                } else {
                    return message.channel.send(`You ain't linked bruh (do ju!link username)`)
                }
            } else { username = args[0] }

            osuApi.getUser({
                u: username,
                m: 0
            }).then(user => {
                // message.channel.send(`Recent score for ${user.name}`)
                osuApi.getUserRecent({
                    u: user.name,
                    m: 0
                }).then(recent => {
                    console.log(recent)
                    let a = args[1] ? args[1] : 0
                    if(!recent[a]) throw('Not found')
                    let bmapid =   recent[a].beatmapId
                    let mods =     recent[a].mods
                    let pmods =    parseMods(mods)
                    let score =    recent[a].score
                    let rank =     recent[a].rank
                    let combo =    recent[a].maxCombo
                    let s300 =     recent[a].counts['300']
                    let s100 =     recent[a].counts['100']
                    let s50 =      recent[a].counts['50']
                    let smiss =    recent[a].counts['miss']
                    let perfect =  recent[a].perfect
                    let counts = Number(s300) + Number(s100) + Number(s50) + Number(smiss)
                    
                    // The thing to calculate
                    let theThing = `(${s50} * 50 + ${s100} * 100 + ${s300} * 300) / (300 * (${smiss} + ${s50} + ${s100} + ${s300})) * 100`
                    let acc = eval(theThing)
                    acc = acc.toFixed(2)
    
                    // SS checker :)
                    let ss = ''
                    if(acc == 100) {
                        ss = 'Tuli ees SS :LETSGO:'
                    } else if (perfect) {
                        ss = 'Tuli ees FC mut ei ees SS'
                    } else {
                        ss = 'Ei ees SS'
                    }

                    // Also have to convert X and SX to SS and stuff
                    switch (rank) {
                        case 'A':
                            rank = '<:A_:881163307350892605>'
                            break
                        case 'B':
                            rank = '<:B_:881163307564798023>'
                            break
                        case 'C':
                            rank = '<:C_:881163307648688129>'
                            break
                        case 'D':
                            rank = '<:D_:881163307250249739>'
                            break
                        case 'S':
                            rank = '<:S_:881163307229282385>'
                            break
                        case 'SH':
                            rank = '<:SH:881163307233456159>'
                            break
                        case 'X':
                            rank = '<:X_:881163307623518268>'
                            break
                        case 'XH':
                            rank = '<:XH:881163307636117524>'
                            break
                        case 'F':
                            rank = '<:F_:881163307585765416>'
                            break
                    }
    
                    // Date formatter thingy
                    let date = recent[a].date
                    let [month, day, year]    = date.toLocaleString().split("/")
                    let [hour, minute, second] = date.toLocaleString().split(/:| /)
                    let _date = `${day}/${month}/${year}`
    
                    // console.log(`${month} ${day} ${year} ${hour} ${minute} ${second}`)
    
                    let bmap
                    getRecentBeatmap(bmapid, mods.includes('NoFail') ? recent[a].raw_mods -1 : recent[a].raw_mods).then((beatmap) => {
                        bmap = beatmap
                    }).finally( () => {
                        console.log(bmap)
			            try {
                            let objects = Number(bmap.objects.normal) + Number(bmap.objects.slider) + Number(bmap.objects.spinner)
                            let completionMath = `(${counts} / ${objects}) * 100`
                            let completion = eval(completionMath).toFixed(2)
                            var embed = new Discord.EmbedBuilder()
                            .setColor('#FF00FF')
                            .setAuthor({ name: `${bmap.artist} - ${bmap.title} [${bmap.version}] | ${Number(bmap.difficulty.rating).toFixed(2)}⭐`, url: `https://osu.ppy.sh/b/${bmapid}`, iconURL: `https://a.ppy.sh/${user.id}` })
                            .setThumbnail(`https://b.ppy.sh/thumb/${bmap.beatmapSetId}l.jpg`)
                            .setDescription(`▸ ${rank} ▸ ${pmods} ▸ ${acc}%\n▸ ${numberWithCommas(score)} ▸ ${combo}/${bmap.maxCombo} ▸ [${s300}/${s100}/${s50}/${smiss}]`)
                            .setFooter({text: `${ss} • ${completion}% completion`})
                        } catch (e) {
                            console.log(e)
                        } finally {
                            message.channel.send({content: `Recent score for ${user.name} <t:${date.getTime()/1000}:R>`, embeds: [embed]})
                        }
                    })
                    
                }).catch(err => {
                    // recent score was not found
                    console.log(err)
                    if(err == "Not found") {
                        message.channel.send("Score was not found")
                    } else {
                        message.channel.send("Something unexpected happened! @Pizzakeitto")
                    }
                })
            }).catch(err => {
                // user was not found
                console.log(err)
                if (err.message){
                    if(err.message == "Not found") {
                        message.channel.send("User was not found")
                    } else {
                        message.channel.send("Something unexpected happened! @Pizzakeitto")
                    }
                } else {
                    message.channel.send("Something unexpected happened! (Most likely the user youre trying to find was not found but yeah idk how to code) @Pizzakeitto")
                }
            })
            
        })
    }
}
