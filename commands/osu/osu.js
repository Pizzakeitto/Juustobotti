module.exports = {
    name: 'osu',
    description: 'Gets user info',
    usage: '[user]',
    execute(message, args){
        const Discord = require('discord.js')
        const mysql = require('mysql')
        const osu = require('node-osu')
        const osuApi = new osu.Api(process.env.OSUTOKEN, {
            notFoundAsError: true,
            completeScores: false,
            parseNumeric: false
        })

        const dbname = 'juustobotdata'
        const {sqlconnection} = require('../../config.json')
        
        function numberWithCommas(x) {
            try {return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            catch(error) {
                console.error("Failed formatting the number, maybe user doesnt exist?")
                return x
            }
        }

        // query function wrap
        function query(sql, callback) {
            let con = mysql.createConnection(sqlconnection)
            
            try {
                con.connect(function (err) {
                    if (err) console.log(err)
                    con.query(sql, callback)
                    con.end()
                })
            } catch (error) {
                console.log(error)
                con.end
            }
        }
        
        function wysi(toparse = ''){
            try {
                return toparse.toString().replace(/(727)|(72,7)|(7,27)|(7\.27)|(72\.7)/g, str => {
                    switch(str){
                        case '727':
                            return '**__727__**'
                        case '72,7':
                            return '**__72,7__**'
                        case '7,27':
                            return '**__7,27__**'
                        case '7.27':
                            return '**__7.27__**'
                        case '72.7':
                            return '**__72.7__**'
                    }
                })
            } catch (err) {
                console.log('couldnt check for 727 :(')
                return toparse
            }
        }

        // console.log(wysi('727 7,27 127,277'))

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

        let usernamePromise = getOsuUsername(message.author.id)
        let username

        // usernamePromise.then(value => { console.log(`username here is ${value}`) })

        usernamePromise.then(username => {
            // console.log(`yeah username here is ${username}`)
            if(args[0] == undefined || null){
                //No arguments given
                if (username != null || undefined) {
                    // message.channel.send(`Your osuname is ${username} right? (If not blame Pizzakeitto)`)
                } else {
                    return message.channel.send(`You ain't linked bruh, do ju!link username`)
                }
            } else { username = args[0] }
    
    
            //calls the osu api for the user object
            osuApi.getUser({
                u: username
            }).then(user => {
                console.log(user)
                let rank = user.pp.rank
                let pp = user.pp.raw            
                let level = parseFloat(user.level)
                let acc = parseFloat(user.accuracy).toFixed(2)
                let plays = user.counts.plays
                let rankedScore = numberWithCommas(user.scores.ranked)
                let totalScore = numberWithCommas(user.scores.total)
                let s300 = numberWithCommas(user.counts[300])
                let s100 = numberWithCommas(user.counts[100])
                let s50 = numberWithCommas(user.counts[50])
                let SS = numberWithCommas(parseInt(user.counts.SS) + parseInt(user.counts.SSH))
                let S = numberWithCommas(parseInt(user.counts.S) + parseInt(user.counts.SH))
                let A = numberWithCommas(user.counts.A)
                let playtimeHours = Math.floor(user.secondsPlayed/3600)
    
                // this map is deprecated since i dont think sql can take maps directly.
                // let userData = new Map()
                // userData.set("name", user.name)
                // userData.set("_id", user.id)
                // userData.set("rank", rank)
                // userData.set("pp", pp)
                // userData.set("level", level)
                // userData.set("acc", acc)
                // userData.set("plays", plays)
                // userData.set("rankedScore", rankedScore)
                // userData.set("totalScore", totalScore)
                // userData.set("s300", s300)
                // userData.set("s100", s100)
                // userData.set("s50", s50)
                // userData.set("playtimeHours", playtimeHours)
    
                userEmbed = new Discord.MessageEmbed()
                    .setColor('#FF00FF')
                    .setAuthor(`Profile for ${user.name}`, `https://pizzakeitto.xyz/flags/flags-iso/shiny/32/${user.country}.png` /* thank https://github.com/ebenh/flags, because `https://www.countryflags.io/${user.country}/shiny/32.png` NOOOOOOO COUNTRYFLAGS.IO IS DOWN!!!! */, `https://osu.ppy.sh/users/${user.id}`)
                    .setThumbnail(`http://s.ppy.sh/a/${user.id}`)
                    .addField("- Performance -", 
                    `**Rank**: ${wysi(rank)}` +
                    `\n**PP**: ${wysi(pp)}` +
                    `\n**Level**: ${wysi(level)}` +
                    `\n**Accuracy**: ${wysi(acc)}` +
                    `\n**Playcount**: ${wysi(plays)}`, true)
    
                    .addField("- Score -", 
                    `**Ranked score**: ${wysi(rankedScore)}` +
                    `\n**Total score**: ${wysi(totalScore)}` +
                    /* `\n**300s**: ${wysi(s300)}` +
                    `\n**100s**: ${wysi(s100)}` +
                    `\n**50s**: ${wysi(s50)}` + */
                    `\n**SS**: ${wysi(SS)}` +
                    `\n**S**: ${wysi(S)}` +
                    `\n**A**: ${wysi(A)}`, true)
    
                    .setFooter(/*`Joined in ${user.joinDate}\nPlaytime: ${playtimeHours}h || */`ID: ${wysi(user.id)}`)
                    .setTimestamp(user.joinDate)
                
                message.channel.send({content: 'Nice profile bro!', embeds: [userEmbed]})

                let updateDBQuery = 
`INSERT INTO playerdata
VALUES ("${user.name}", "${user.id}", "${rank}", "${pp}", "${level}", "${acc}", "${plays}", "${user.scores.ranked}", "${user.scores.total}", "${user.counts[300]}", "${user.counts[100]}", "${user.counts[50]}", "${playtimeHours}")
ON DUPLICATE KEY UPDATE 
username="${user.name}", 
userid="${user.id}",
rank="${rank}", 
pp="${pp}", 
level="${level}", 
acc="${acc}", 
playcount="${plays}", 
rankedscore="${user.scores.ranked}", 
totalscore="${user.scores.total}", 
s300="${user.counts[300]}", 
s100="${user.counts[100]}", 
s50="${user.counts[50]}", 
playtimehours="${playtimeHours}"`

                query(updateDBQuery, (err, res, fields) => {
                    if (err) return console.error(err)
                })
    
            }).catch(error => {
                if(error.message == 'Not found'){
                    message.channel.send(`osu said that user ${username} doesn't exist.`)
                    console.error(error)
                }
                else {
                    message.channel.send("Something unexpected happened!!!11!1!")
                    console.error(error)
                }
            })
        })
    }
}
