const Discord = require('discord.js')
const axios = require('axios').default

module.exports = {
	name: 'wolfram',
	description: 'Get some useful information from Wolfram|Alpha',
    detailedDescription: 'This command uses Wolfram|Alpha to get some interesting knowledge for you.',
    usage: 'wolfram [question or something like that]',
	execute(message = Discord.Message.prototype, args = []) {
        if(args.length == 0) return message.channel.send("What do you want me to look up?")
        const embed = new Discord.EmbedBuilder
        embed.setAuthor({name: "Wolfram|Alpha"})
        // The icon for the thumbnail originally found from https://www.wolframalpha.com/about, there is the svg file for the fancy icon
        // I downloaded it, converted to png and uploaded to my website, please no copyright strikerino 🤗
        embed.setThumbnail("https://pizzakeitto.xyz/wolframalpha.png")
        embed.setColor("#FF7E00")
        embed.addFields({name: "Query:", value: args.join(" ")})
        embed.setFooter({text: "Provided by https://wolframalpha.com"})
    
        axios(`http://api.wolframalpha.com/v2/result?i=${args.join(" ")}&appid=${process.env.WOLFRAMID}&units=metric&output=json&ip=1.1.1.1`)
        .then(response => {
            if(response.status == 200) {
                embed.addFields({name: "Response: ", value: response.data.toString()})
            }
        })
        .catch((err) => {
            if(err.response.data == "No short answer available") {
                embed.addFields({name: "Response: ", value: `${err.response.data}. However, you can try to find info by clicking [here](https://www.wolframalpha.com/input/?i=${args.join("%20")})`})
            } else {
                embed.addFields({name: "Response: ", value: err.response.data})
            }
            console.log(err.message)
        })
        .finally(() => {
            message.channel.send({embeds: [embed]})
        })
    }
}