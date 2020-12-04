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

        user = osuApi.getUser({
            u: args[0],
            m: 0
        }).then(user => {
            message.channel.send(`Recent score for ${user.name}`)
            osuApi.getUserRecent({
                u: user.name,
                m: 0
            }).then(recent => {
                var bmap = recent[0].beatmap;
                var bmapid = recent[0].beatmapId;
                var mods = recent[0].mods;
                var score = recent[0].score;
                var acc = recent[0].accuracy;
                var pp = recent[0].pp;
                var rank = recent[0].rank;
                var combo = recent[0].maxCombo;
                var maxcombo = '';
                var s300 = recent[0].counts['300'];
                var s100 = recent[0].counts['100'];
                var s50 = recent[0].counts['50'];
                var smiss = recent[0].counts['miss']
                var ss = '';
                if(recent[0].perfect == true) ss = 'Tuli ees SS :LETSGO:'; else ss = 'Ei ees ss';
                osuApi.getBeatmaps({ b: bmapid }).then(beatmaps => {maxcombo = beatmaps[0].maxCombo})
                
                //TODO: Values are not displaying properly
                embed = new Discord.MessageEmbed()
                    .setColor('#FF00FF')
                    .setAuthor(`${bmap} [diff name here] + ${mods}`, `https://a.ppy.sh/${user.id}`, `https://osu.ppy.sh/b/${bmapid}`)
                    .setDescription(`▸ ${rank} ▸ ${pp} ▸ ${acc}\n▸ ${score} ▸ ${combo}/${maxcombo} ▸ [${s300}/${s100}/${s50}/${smiss}]`)
                    .setFooter(`${pp} | at ${recent[0].date}`)

                message.channel.send(embed);
            }).catch(err => {
                message.channel.send(err);
            })
        })
    }
}