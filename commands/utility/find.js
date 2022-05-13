const Discord = require('discord.js')
module.exports = {
    name: "find",
    description: "Finds discord user by id",
    hidden: true,
    async execute(message = Discord.Message.prototype, args = []) {
        if (message.author.id != "246721024102498304") return message.channel.send("no")
        const user = await message.client.users.fetch(`${args[0]}`)
            .catch(err => {
                message.channel.send(`Error: ${err.message}`)
                return false
            })
        
        if (user) message.channel.send(JSON.stringify(user, null, 2), {code: 'json'})
    }
}