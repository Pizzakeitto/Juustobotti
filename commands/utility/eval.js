const Discord = require('discord.js')

module.exports = {
    name: 'eval',
    description: 'Evaluate code from mesag',
    hidden: true,
    execute(message = Discord.Message.prototype, args = []){
        if(!args){
            return message.channel.send("Nothing to eval!")
        }

        if (message.author.id != "246721024102498304") {
            return message.channel.send("Youre not Pizzakeitto (Sorry i prefer leaving this command for me only) ?!?!")
        }
        let newargs = message.content.slice(prefix.length + 4).trim()

        try {
            let evaled = eval(`${newargs}`)
            message.channel.send(evaled.toString()).catch(err => {
                if(err.message == "Cannot send an empty message") message.channel.send("*no output*")
                else {
                    console.log(err)
                    message.channel.send("Something unexpected happened!")
                }
            })
        } catch (error){
            message.channel.send(`Didnt work: ${error}`)
        }

    }
}