module.exports = {
    name: 'osu',
    description: 'Gets user info',
    execute(message, args){
        const Discord = require('discord.js');
        const osu = require('node-osu');
        const {osutoken} = require('../tokens.json');
        const osuApi = new osu.Api(osutoken, {
            notFoundAsError: true,
            completeScores: false,
            parseNumeric: false
        });
        
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
            var level = parseFloat(user.level).toFixed(4);
            var acc = parseFloat(user.accuracy).toFixed(2);
            var rankedScore = numberWithCommas(user.scores.ranked);
            var totalScore = numberWithCommas(user.scores.total);
            var s300 = numberWithCommas(user.counts[300]);
            var s100 = numberWithCommas(user.counts[100]);
            var s50 = numberWithCommas(user.counts[50]);
            var playtimeHours = Math.floor(user.secondsPlayed/3600)

            userEmbed = new Discord.MessageEmbed()
                .setColor('#FF00FF')
                .setAuthor(`Profile for ${user.name}`, `https://www.countryflags.io/${user.country}/shiny/32.png`, `https://osu.ppy.sh/users/${user.id}`)
                .setThumbnail(`http://s.ppy.sh/a/${user.id}`)
                .addField("- Performance -", 
                `
                **Rank**: ${user.pp.rank}
                **PP**: ${user.pp.raw}
                **Level**: ${level}
                **Accuracy**: ${acc}
                **Playcount**: ${user.counts.plays}
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