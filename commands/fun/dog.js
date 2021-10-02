const Discord = require('discord.js')
module.exports = {
    name: 'dog',
    description: 'doggo',
    execute(message = new Discord.Message, args = []){
        const https = require('https')
        const apiurl = "api.thedogapi.com"
        const apipath = "/v1/images/search"
        const apikey = process.env.DOGAPIKEY

        message.channel.startTyping()
        try {
            https.get({
                headers: { 'X-API-KEY': apikey},
                hostname: apiurl,
                path: `${apipath}?has_breeds=true&mime_types=jpg,png&limit=1`
            }, (res) => {
                if(res.statusCode != 200) return function () {
                    message.channel.send('Something went wrong!')
                    message.channel.stopTyping()
                }
                let data = ""
                res.on('data', (d) => {
                    data += d
                })
    
                res.on('end', () => {
                    data = JSON.parse(data)
                    let dogurl = data[0].url
                    message.channel.send({files: [dogurl]})
                    message.channel.stopTyping()
                })
            })
        } catch (error) {
            message.channel.send("Something went wrong! (Pls ping Pizzakeitto if you see this)")
            console.error(error)
        }
        
    }
}