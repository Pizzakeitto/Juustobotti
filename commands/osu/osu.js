module.exports = {
    name: 'osu',
    description: 'Gets user info',
    usage: '[user]',
    execute(message, args){
        const Discord = require('discord.js');
        const mysql = require('mysql')
        const osu = require('node-osu');
        const osuApi = new osu.Api(process.env.OSUTOKEN, {
            notFoundAsError: true,
            completeScores: false,
            parseNumeric: false
        });

        const dbname = 'juustobotdata';
        const {sqlconnection} = require('../../config.json')
        
        function numberWithCommas(x) {
            try {return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');}
            catch(error) {
                console.error("Failed formatting the number, maybe user doesnt exist?");
            }
        }

        // query function wrap
        function query(sql, callback) {
            let con = mysql.createConnection(sqlconnection);
            
            con.connect(function (err) {
                if (err) throw err;
                con.query(sql, callback);
                con.end()
            });
        }
        
        function wysi(toparse = ''){
            return toparse.toString().replace(/(727)|(72,7)|(7,27)/g, str => {
                switch(str){
                    case '727':
                        return '**__727__**'
                    case '72,7':
                        return '**__72,7__**'
                    case '7,27':
                        return '**__7,27__**'
                }
            })
        }

        // console.log(wysi('727 7,27 127,277'))

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

        let usernamePromise = getOsuUsername(message.author.id);
        let username;

        // usernamePromise.then(value => { console.log(`username here is ${value}`); });

        usernamePromise.then(username => {
            // console.log(`yeah username here is ${username}`)
            if(args[0] == undefined || null){
                //No arguments given
                if (username != null || undefined) {
                    // message.channel.send(`Your osuname is ${username} right? (If not blame Pizzakeitto)`);
                } else {
                    return message.channel.send(`You ain't linked bruh`);
                }
            } else { username = args[0]; }
    
    
            //calls the osu api for the user object
            osuApi.getUser({
                u: username
            }).then(user => {
                var rank = user.pp.rank;
                var pp = user.pp.raw;            
                var level = parseFloat(user.level)
                var acc = parseFloat(user.accuracy).toFixed(2);
                var plays = user.counts.plays;
                var rankedScore = numberWithCommas(user.scores.ranked);
                var totalScore = numberWithCommas(user.scores.total);
                var s300 = numberWithCommas(user.counts[300]);
                var s100 = numberWithCommas(user.counts[100]);
                var s50 = numberWithCommas(user.counts[50]);
                var SS = numberWithCommas(parseInt(user.counts.SS) + parseInt(user.counts.SSH));
                var S = numberWithCommas(parseInt(user.counts.S) + parseInt(user.counts.SH));
                var A = numberWithCommas(user.counts.A);
                var playtimeHours = Math.floor(user.secondsPlayed/3600)
    
                // this map is deprecated since i dont think sql can take maps directly.
                let userData = new Map();
                userData.set("name", user.name);
                userData.set("_id", user.id);
                userData.set("rank", rank);
                userData.set("pp", pp);
                userData.set("level", level);
                userData.set("acc", acc);
                userData.set("plays", plays);
                userData.set("rankedScore", rankedScore);
                userData.set("totalScore", totalScore);
                userData.set("s300", s300);
                userData.set("s100", s100);
                userData.set("s50", s50);
                userData.set("playtimeHours", playtimeHours);
    
                userEmbed = new Discord.MessageEmbed()
                    .setColor('#FF00FF')
                    .setAuthor(`Profile for ${user.name}`, `https://www.countryflags.io/${user.country}/shiny/32.png`, `https://osu.ppy.sh/users/${user.id}`)
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
                    .setTimestamp(user.joinDate);
                
                message.channel.send('Nice profile bro!', {embed: userEmbed});

                var updateDBQuery = 
`INSERT INTO playerdata
VALUES ("${user.name}", "${rank}", "${pp}", "${level}", "${acc}", "${plays}", "${user.scores.ranked}", "${user.scores.total}", "${user.counts[300]}", "${user.counts[100]}", "${user.counts[50]}", "${playtimeHours}")
ON DUPLICATE KEY UPDATE 
username="${user.name}", 
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
playtimehours="${playtimeHours}";`

                query(updateDBQuery, (err, res, fields) => {
                    if (err) return console.error(err);
                })
    
            }).catch(error => {
                if(error.message == 'Not found'){
                    message.channel.send("User was not found (or the bot is poopoo)");
                    console.error(error);
                }
                else {
                    message.channel.send("Something unexpected happened!!!11!1!")
                    console.error(error);
                };
            });
        })
    }
}
