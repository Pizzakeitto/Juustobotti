const Discord = require('discord.js')

module.exports = {
    name: 'nukesweden',
    description: 'Nukes sweden',
    detailedDescription: 'Ever wanted to nuke Sweden? With this command you can!\n\n||(For legal reasons this is a joke)||',
    hidden: true,
    execute(message = new Discord.Message, args = [""]) {
        message.channel.send(":bomb: :flag_se: :arrow_right: :boom:")
        message.channel.send("||note: for legal reasons this is a bad joke||")
    }
}