const Discord = require('discord.js');

module.exports = {
    name: 'cooltext',
    description: 'Generates some cool text!',
    usage: '',
    execute(message = new Discord.Message, args = []){
        const axios = require('axios')

        let text = args.join(' ').toString()
        console.log(text)
        axios.post('https://cooltext.com/PostChange', `LogoID=4&Text=${text}&FontSize=70&Color1_color=%23FF0000&Integer1=15&Boolean1=on&Integer9=0&Integer13=on&Integer12=on&BackgroundColor_color=%23FFFFFF`).then(res => {
            // console.log(res.data)
            message.channel.send(res.data.renderLocation)
            
        })
    }
}