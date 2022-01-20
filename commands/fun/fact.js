const Discord = require('discord.js')
const axios = require('axios').default

module.exports = {
    name: 'fact',
    description: 'Gives a random fact, from Wikipedia.org, the free encyclepedia.',
    detailedDescription: 'This command fills your brain with useful information! [Sauce](https://en.wikipedia.org/w/api.php)',
    async execute(message = Discord.Message.prototype, args = []){
        const apiurl = "https://en.wikipedia.org/w/api.php"
        
        const randomRequest = await axios.get(apiurl, {params: {
            'action': 'query',
            'generator': 'random',
            'grnnamespace': 0,
            'format': 'json'
        }}).catch(err => {
            message.channel.send('Something unexpected happened while fetching facts for you!\n(Ping Pizzakeitto if you see this)')
            console.log(err)
            return
        })
        
        // Thanks Ecolipsy for help with this line!!
        const page = randomRequest.data.query.pages[Object.keys(randomRequest.data.query.pages)[0]]
        const pageid = page.pageid
    
        const extractRequest = await axios.get(apiurl, {params: {
            'action': 'query',
            'prop': 'extracts',
            'exsentences': 1,
            'explaintext': true,
            'exsectionformat': 'plain',
            'pageids': pageid,
            'format': 'json'
        }}).catch(err => {
            message.channel.send('Something unexpected happened while fetching facts for you!\n(Ping Pizzakeitto if you see this)')
            console.log(err)
            return
        })
    
        const extractedText = extractRequest.data.query.pages[Object.keys(extractRequest.data.query.pages)[0]].extract
        
        const embed = new Discord.MessageEmbed({
            title: 'Facts!',
            color: '#00f000',
            description: `Did you know, that ${extractedText}`,
            footer: {text: 'Powered by the Wikipedia api! https://www.mediawiki.org/wiki/API:Main_page'},
        })

        message.channel.send({embeds: [embed]}).catch(err => {
            message.channel.send('Something unexpected happened while fetching facts for you!\n(Ping Pizzakeitto if you see this)')
            console.log(err)
            console.log(JSON.stringify(embed, null, 2))
            return
        })
    }
}