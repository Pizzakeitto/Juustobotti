module.exports = {
    name: 'link',
    description: 'Links your discord name with your osu! name',
    detailedDescription: 'You can save your osu!username for me to rember so you dont have to type your username for every osu related command!',
    usage: 'link [your osu username]',
    execute(message = Discord.Message.prototype, args = [""]){
        if(args[0] == undefined){
            return message.channel.send("Pls specify your osu username!!")
        }
        const mariadb = require('mariadb')
        const { sqlconfig } = require('../../config.json')
        const { v2, auth } = require('osu-api-extended')

        const osuUsername = args.join(" ")
        
        mariadb.createConnection(sqlconfig).then(async connection => {
            await auth.login(process.env.OSUCLIENTID, process.env.OSUCLIENTSECRET)
            const osuUser = await v2.user.details(osuUsername, "osu", "username")
            if(Object.getOwnPropertyNames(osuUser).includes("error")) return message.channel.send("couldnt find this dude in osu sorry! (are you banned?)")

            const response = await connection.query(`
                INSERT INTO players (
                    discordid, 
                    osuname, 
                    osuid
                ) VALUES (
                    ?, 
                    ?, 
                    ?
                ) ON DUPLICATE KEY UPDATE
                    osuname=?,
                    osuid=?`, 
                [
                    message.author.id, 
                    osuUsername, 
                    osuUser.id, 
                    osuUsername, 
                    osuUser.id
                ]
            )
            .catch(err => {
                console.log(err)
            })
            if(!response) return message.reply("no response from the db?? ping Pizzakeitto") // shouldnt happen, but just in case
            if(response.affectedRows >= 1) {
                message.channel.send(`Yup, you're linked aight. Now you can do \`${prefix}osu\` and \`${prefix}rs\` without having to type your username!`)
                console.log(message.author.tag + " got saved to the database")
                connection.end()
            } else {
                message.channel.send(`Something unexpected happened, I think... You can try doing \`${prefix}osu\` anyway`)
                console.log(response)
                connection.end()
            }
        })
    }
}