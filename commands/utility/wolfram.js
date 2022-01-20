const Discord = require('discord.js')
const axios = require('axios').default

module.exports = {
	name: 'wolfram',
	description: 'Get some useful information from Wolfram|Alpha',
    detailedDescription: 'This command uses Wolfram|Alpha to get some interesting knowledge for you.',
    usage: 'wolfram [question or something like that]',
	execute(message = Discord.Message.prototype, args = []) {
        if(args.length == 0) return message.channel.send("What do you want me to look up?")
        const embed = new Discord.MessageEmbed
        embed.setAuthor({name: "Wolfram|Alpha"})
        // The icon for the thumbnail originally found from https://www.wolframalpha.com/about, there is the svg file for the fancy icon
        // I downloaded it, converted to png and uploaded to my website, please no copyright strikerino 🤗
        embed.setThumbnail("https://pizzakeitto.xyz/wolframalpha.png")
        embed.setColor("#FF7E00")
        embed.addField("Query:", args.join(" "))
        embed.setFooter({text: "Provided by https://wolframalpha.com"})
    
        axios(`http://api.wolframalpha.com/v2/result?i=${args.join(" ")}&appid=${process.env.WOLFRAMID}&units=metric&output=json&ip=1.1.1.1`)
        .then(response => {
            if(response.status == 200) {
                embed.addField("Response: ", response.data.toString())
            }
        })
        .catch((err) => {
            embed.addField("Response: ", err.response.data)
            console.log(err.message)
        })
        .finally(() => {
            message.channel.send({embeds: [embed]})
        })
    }
}