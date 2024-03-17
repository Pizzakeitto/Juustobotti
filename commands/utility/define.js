const Discord = require('discord.js')

module.exports = {
    name: 'define',
    description: 'Gets the definition for something',
    detailedDescription: "Have you ever wanted to know what something means? Now you can find out! (This uses [OpenAI's](https://openai.com) API)\n\nJust do `ju!define [a word]` to find out stuff! Your question cannot include these characters: \" ' ` \\",
    execute(message = Discord.Message.prototype, args = [""]) {
        const axios = require('axios').default
        const endpoint = "https://api.openai.com/v1/chat/completions"
        const filterEndpoint = "https://api.openai.com/v1/engines/content-filter-alpha/completions" // OpenAI content filter
        const headers = {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${process.env.OPENAIKEY}`
        }

        // Ratelimit to 10s
        if (global.definitionCooldownArray.includes(message.author.id)) {
            message.react("🦥")
            return
        }
        global.definitionCooldownArray.push(message.author.id)
        setTimeout(() => {
            global.definitionCooldownArray = global.definitionCooldownArray.filter(function(value, index, arr) {
                return value != message.author.id
            })
        }, 5000);

        // Limit characters to idk 64 to avoid very deep guestions
        const stuffToDefine = args.join(' ')
        if (stuffToDefine.length >= 180) return message.channel.send('Sorry bro, limited to 180 characters!')

        // Make sure nobody's tryna play with the AI 👀
        let testRegex = /["'\\]/g
        if (testRegex.test(stuffToDefine)) return message.channel.send("Sorry, you can't ask that! Check `ju!help define` to see what characters aren't allowed.")
        
        // Functions to make life easier i guess
        async function define(something) {
            const res = await axios.post(endpoint, {
                "model": "gpt-3.5-turbo",
                "messages": [
                    {
                      "role": "system",
                      "content": "You are an assistant who knows every word and is willing to help users define words. Keep answers short but useful."
                    },
                    {
                      "role": "user",
                      "content": `Define "${something}"`
                    }
                  
                ],
                "temperature": 1,
                "max_tokens": 256,
                "top_p": 1,
                "frequency_penalty": 0,
                "presence_penalty": 0
            },
            { headers: headers } )
            return res.data.choices[0].message.content.trim()
        }

        async function contentFilter(something) {
            const res = await axios.post(filterEndpoint, {
                "prompt": `<|endoftext|>${something}\n--\nLabel:`,
                "temperature": 0,
                "max_tokens": 1,
                "top_p": 0,
                "logprobs": 10
            }, { headers: headers } )
            return res.data.choices[0].text.trim()
        }

        // I yeet everything here because async is nice
        main()
        async function main() {
            let warning
            message.channel.sendTyping()
            // Check the question just in case
            // 0 = safe
            // 1 = may contain political stuff
            // 2 = not safe DO NOT USE
            const preFilter = await contentFilter(stuffToDefine)
            if (preFilter == "2") return message.reply("The thing youre asking to be defined has been detected by the AI's content filter. Try something else.")
            if (preFilter == "1") warning = "⚠️ THIS MAY BE POLITICAL OR OTHERWISE CONTREVERSAL! TAKE THIS WITH A GRAIN OF SALT! ⚠️"
            
            // If the question is safe, do the defining
            const definition = await define(stuffToDefine)
            console.log(`Got definition for ${stuffToDefine}: ${definition}`)

            // Second content filter pass
            // I know repeating code bad cry about it
            const secondFilter = await contentFilter(definition)
            if (secondFilter == "2") return message.reply("The AI's response has been flagged, so no definition for you. Try something else.")
            if (secondFilter == "1") warning = "⚠️ THIS MAY BE POLITICAL OR OTHERWISE CONTREVERSAL! TAKE THIS WITH A GRAIN OF SALT! ⚠️"

            // If everything is good, send it
            const embed = new Discord.EmbedBuilder()
            if (warning != undefined) embed.setTitle(warning)
            embed.setAuthor({ name: `Definition of ${stuffToDefine}` })
            embed.setDescription(`${definition}\n\nProvided by [OpenAI's](https://openai.com) gpt-3.5-turbo engine.`)
            embed.setColor('#00f000')
            message.channel.send({embeds: [embed]})
        }
    }
}