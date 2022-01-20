const Discord = require('discord.js')

module.exports = {
    name: 'nukesweden',
    description: 'Nukes sweden',
    detailedDescription: 'Ever wanted to nuke Sweden? With this command you can!\n\n||(For legal reasons this is a joke)||',
    execute(message = new Discord.Message, args = [""]) {
        message.channel.send(":bomb: :flag_se: :arrow_right: :boom:")
    }
}