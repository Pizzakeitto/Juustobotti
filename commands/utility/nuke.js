const Discord = require('discord.js');

module.exports = {
    name: 'nukesweden',
    description: 'nukes sweden',
    execute(message = new Discord.Message, args = [""]) {
        message.channel.send(":bomb: :flag_se: :arrow_right: :boom:")
    }
}