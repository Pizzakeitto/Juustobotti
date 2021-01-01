module.exports = {
    name: 'osu',
    description: 'Gets user info',
    execute(message, args){
        const Discord = require('discord.js');
        const osu = require('node-osu');
        const osuApi = new osu.Api(process.env.OSUTOKEN, {
            notFoundAsError: true,
            completeScores: false,
            parseNumeric: false
        });

        const MongoClient = require('mongodb').MongoClient;
        const dbname = 'juustobotData';
        const dburl = process.env.DBURL + dbname;

        //var username;
        
        function numberWithCommas(x) {
            try {return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');}
            catch(error) {
                console.log("User doesnt exist lol");
            }
        }

        function getUsernameFromDB(){
            MongoClient.connect(dburl,  {useUnifiedTopology: true}, function(err, client) {
                try {
                    console.log("Connected to mongo lol");
                    if(err) {
                        console.error(err);
                        client.close();
                        return;
                    }
                    const db = client.db(dbname)
                    let userid = message.author.id;
                    db.collection("userLinks").findOne({'_id': userid}, function(err, res) {
                        if(err) {
                            console.error(err);
                            client.close;
                            return;
                        };
                        if(res == null) {
                            return null;
                        }
                        console.log("Found database entry: " + res);
                        client.close;
                        return res.osuname;
                    });
                } catch (error) {
                    console.log(error);
                }
            })
        }

        if(args[0] == undefined || null){
            //message.channel.send("No args lol");
            let username = getUsernameFromDB();
            if (username != null) {
                message.channel.send(`Your osuname is ${username} right?`);
            } else {
                message.channel.send(`You ain't linked bruh`);
            }
            console.log(username + " in line 56");
        } else { username = args[0]; }

        console.log(`Username at line 59 is ${username}`);

        //calls the osu api for the user object
        osuApi.getUser({
            u: username
        }).then(user => {
            var rank = user.pp.rank;
            var pp = user.pp.raw;            
            var level = parseFloat(user.level).toFixed(4);
            var acc = parseFloat(user.accuracy).toFixed(2);
            var plays = user.counts.plays;
            var rankedScore = numberWithCommas(user.scores.ranked);
            var totalScore = numberWithCommas(user.scores.total);
            var s300 = numberWithCommas(user.counts[300]);
            var s100 = numberWithCommas(user.counts[100]);
            var s50 = numberWithCommas(user.counts[50]);
            var playtimeHours = Math.floor(user.secondsPlayed/3600)

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
                `**Rank**: ${rank}` +
                `\n**PP**: ${pp}` +
                `\n**Level**: ${level}` +
                `\n**Accuracy**: ${acc}` +
                `\n**Playcount**: ${plays}`, true)

                .addField("- Score -", 
                `**Ranked score**: ${rankedScore}` +
                `\n**Total score**: ${totalScore}` +
                `\n**300s**: ${s300}` +
                `\n**100s**: ${s100}` +
                `\n**50s**: ${s50}`, true)

                .setFooter(`Joined in ${user.joinDate}\nPlaytime: ${playtimeHours}h || ID: ${user.id}`);
            
            message.channel.send(userEmbed);


            MongoClient.connect(dburl, function(err, client) {
                if(err) {
                    console.error(err);
                    client.close();
                    return;
                }
                console.log("Connected to mongo server");
                
                const db = client.db(dbname);
                db.collection("userdata").insertOne(userData, function(err, res){
                    if(err) {
                        console.log('Yeah it already exists dumfuk')
                        //db.collection("userdata").updateOne({'_id': user.id}, userData);
                        db.collection("userdata").deleteOne({'_id': user.id});
                        db.collection("userdata").insertOne(userData);
                    }
                    console.log("Userdata saved: " + res);
                    client.close();
                })
                
            })

        }).catch(error => {
            if(error.message == 'Not found'){
                message.channel.send("User was not found (or the bot is poopoo)");
                console.error(error);
            }
            else {
                message.channel.send("Something unexpected happened! (Is the user banned or some shit idfk????)")
                console.error(error);
            };
        });
    }
}