const Discord = require('discord.js');

module.exports = {
    name: 'eval',
    description: 'Evaluate code from mesag',
    execute(message = new Discord.Message, args = []){
        if(!args){
            return message.channel.send("Nothing to eval!")
        }

        if (message.author.id != "246721024102498304") {
            return message.channel.send("Youre not Pizzakeitto (Sorry i prefer leaving this command for me only) ?!?!")
        }
        const {prefix} = require('../../config.json');
        var newargs = message.content.slice(prefix.length + 4).trim();

        try {
            let evaled = eval(`${newargs}`)
            if(evaled) {
                message.channel.send(evaled).catch(err => {})
            }
        } catch (error){
            message.channel.send(`Didnt work: ${error}`);
        }

    }
}