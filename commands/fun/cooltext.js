const Discord = require('discord.js')

module.exports = {
    name: 'cooltext',
    description: 'Generates some cool text!',
    detailedDescription: 'You can generate some cool looking text with this command 😎 This uses [cooltext.com](https://cooltext.com/)\'s "Burning text generator".',
    usage: 'cooltext [any text]',
    execute(message = new Discord.Message, args = []){
        const https = require('https')
        const axios = require('axios').default // The "default" is for intellisense and stuff

        if(args.length == 0) {
            return message.channel.send("What text do I generate? lol")
        }

        message.channel.sendTyping()

        let text = args.join(' ').toString()
        // Temporarily ignore SSL stuff (not secure this way but idc its just text)
        const agent = new https.Agent({  
            rejectUnauthorized: false
        })
        axios.post('https://cooltext.com/PostChange', `LogoID=4&Text=${text}&FontSize=70&Color1_color=%23FF0000&Integer1=15&Boolean1=on&Integer9=0&Integer13=on&Integer12=on&BackgroundColor_color=%23FFFFFF`, {httpsAgent: agent}).then(res => {
            // console.log(res.data)
            let httplocation = res.data.renderLocation.replace('https', 'http')
            message.channel.send({
                files: [`${httplocation}`]
            })
        })
    }
}