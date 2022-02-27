const Discord = require('discord.js')

module.exports = {
    name: 'define',
    description: 'Gets the definition for something',
    detailedDescription: "Have you ever wanted to know what something means? Now you can find out! (This uses [OpenAI's](https://openai.com) API)\n\nJust do `ju!define [a word]` to find out stuff! Your question cannot include these characters: \" ' ` \\",
    execute(message = Discord.Message.prototype, args = [""]) {
        const axios = require('axios').default
        const endpoint = "https://api.openai.com/v1/engines/text-babbage-001/completions" // Using babbage because it fast :)
        const filterEndpoint = "https://api.openai.com/v1/engines/content-filter-alpha/completions" // OpenAI content filter
        const headers = {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${process.env.OPENAIKEY}`
        }

        // Ratelimit to 10s
        if (global.definitionCooldownArray.includes(message.author.id)) return message.react("🛑")
        global.definitionCooldownArray.push(message.author.id)
        setTimeout(() => {
            global.definitionCooldownArray = global.definitionCooldownArray.filter(function(value, index, arr) {
                return value != message.author.id
            })
        }, 10000);

        // Limit characters to idk 64 to avoid very deep guestions
        const stuffToDefine = args.join(' ')
        if (stuffToDefine.length >= 64) return message.channel.send('Sorry bro, limited to 64 characters!')

        // Make sure nobody's tryna play with the AI 👀
        let testRegex = /["'\\]/g
        if (testRegex.test(stuffToDefine)) return message.channel.send("Sorry, you can't ask that! Check `ju!help define` to see what characters aren't allowed.")
        
        // Lets ask the AI what this means
        // Set typing status to indicate that the AI is thinking
        message.channel.sendTyping()
        axios.post(endpoint, {
            "prompt": `Define "${stuffToDefine}"\n`,
            "temperature": 0.1,
            "max_tokens": 100,
            "top_p": 1,
            "frequency_penalty": 0,
            "presence_penalty": 0
        },
        { headers: headers } ).then((res) => {
            if (res.status != 200) {
                message.channel.send("Something did the epic fail!")
                console.log(res)
                return
            }
            // We got a response, cool, lets check it for any sensitive stuff
            const definition = res.data.choices[0].text.trim()
            console.log(`Got definition for ${stuffToDefine}: ${definition}`)

            // Lets shove the thing through OpenAI's content filter
            // https://beta.openai.com/docs/engines/content-filter
            axios.post(filterEndpoint, {
                "prompt": `<|endoftext|>${definition}\n--\nLabel:`,
                "temperature": 0,
                "max_tokens": 1,
                "top_p": 0,
                "logprobs": 10
            }, { headers: headers } ).then((filterRes) => {
                // I know this .then stack looks horrible but its 4:57 am so i dont care

                // 0 = safe
                // 1 = may contain political stuff
                // 2 = not safe DO NOT USE
                if (filterRes.data.choices[0].text == "2") return message.channel.send("The thing youre asking to be defined cannot be defined, please send your cringe to google or something >:(\n(for legal reasons this is a bad joke)")
                let warning;
                if (filterRes.data.choices[0].text == "1") warning = "⚠️ THIS MAY BE POLITICAL OR OTHERWISE CONTREVERSAL! TAKE THIS WITH A GRAIN OF SALT! ⚠️"

                const embed = new Discord.MessageEmbed()
                if (warning != undefined) embed.setTitle(warning)
                embed.setAuthor({ name: `Definition of ${stuffToDefine}` })
                embed.setDescription(`${definition}\n\nProvided by [OpenAI's](https://openai.com) Babbage engine.`)
                embed.setColor('#00f000')
                message.channel.send({embeds: [embed]})
            })
        })
    }
}