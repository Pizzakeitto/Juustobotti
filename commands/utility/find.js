const Discord = require('discord.js')
module.exports = {
    name: "find",
    description: "Finds discord user by id",
    hidden: true,
    async execute(message = new Discord.Message, args = []) {
        const user = await message.client.users.fetch(`${args[0]}`)
            .catch(err => {
                message.channel.send(`Error: ${err.message}`)
                return false
            })
        
        if (user) message.channel.send(JSON.stringify(user, null, 2), {code: 'json'})
    }
}