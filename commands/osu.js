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
        const assert = require('assert');
        const dbname = 'juustobotData';
        const dburl = process.env.DBURL + dbname;

        if(!args){
            return message.channel.send("No arguments given!")
        }

        function numberWithCommas(x) {
            try {return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');}
            catch(error) {
                console.log("User doesnt exist lol");
            }
        }

        
        //calls the osu api for the user object
        osuApi.getUser({
            u: args[0]
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
            //console.log(userData);

            userEmbed = new Discord.MessageEmbed()
                .setColor('#FF00FF')
                .setAuthor(`Profile for ${user.name}`, `https://www.countryflags.io/${user.country}/shiny/32.png`, `https://osu.ppy.sh/users/${user.id}`)
                .setThumbnail(`http://s.ppy.sh/a/${user.id}`)
                .addField("- Performance -", 
                `
                **Rank**: ${rank}
                **PP**: ${pp}
                **Level**: ${level}
                **Accuracy**: ${acc}
                **Playcount**: ${plays}
                `, true)

                .addField("- Score -", `
                **Ranked score**: ${rankedScore}
                **Total score**: ${totalScore}
                **300s**: ${s300}
                **100s**: ${s100}
                **50s**: ${s50}
                `, true)

                .setFooter(`Joined in ${user.joinDate}\nPlaytime: ${playtimeHours}h || ID: ${user.id}`);
            
            message.channel.send(userEmbed);
            
            //createDatabase();

            MongoClient.connect(dburl, function(err, client) {
                assert.strictEqual(null, err);
                console.log("Connected to mongo server");
                
                const db = client.db(dbname);
                /*db.collection("userdata").insertOne(userData, function(err, res){
                    assert.strictEqual(null, err);
                    console.log("Userdata saved ???");
                    client.close();
                })*/
                db.collection("userdata").updateOne({"name" : userData[0]}, { $set: {userData} }, function(err, res) {
                    assert.strictEqual(null, err);
                    console.log("Userdata saved: " + res);
                    client.close();
                })
            })

        }).catch(error => {
            if(error.message == 'Not found'){
                message.channel.send("User was not found (or the bot is poopoo)");
            }
            else {
                message.channel.send("Something unexpected happened! (Is the user banned or some shit idfk????)")
                console.log(error);
            };
        });
    }
}