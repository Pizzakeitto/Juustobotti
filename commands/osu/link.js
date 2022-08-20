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
        
        mariadb.createConnection(sqlconfig).then(async connection => {
            await auth.login(process.env.OSUCLIENTID, process.env.OSUCLIENTSECRET)
            const osuUser = await v2.user.details(args[0], "osu")

            const response = await connection.query(`INSERT INTO players (discordid, osuname, osuid) VALUES ('${message.author.id}', '${args[0]}', '${osuUser.id}') ON DUPLICATE KEY UPDATE osuname='${args[0]}', osuid='${osuUser.id}'`)
            .catch(err => {
                console.log(err)
            })
            if(response.affectedRows >= 1) {
                message.channel.send("Yup, you're linked aight. Now you can do `ju!osu` and `ju!rs` without having to type your username!")
                console.log(message.author.tag + " got saved to the database")
                connection.end()
            } else {
                message.channel.send("Something unexpected happened, I think... You can try doing `ju!osu` anyway")
                console.log(response)
                connection.end()
            }
        })
    }
}