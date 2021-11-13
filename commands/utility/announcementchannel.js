const Discord = require('discord.js')

module.exports = {
    name: 'announcementchannel',
    description: 'Gets recent scores',
    usage: '[user]',
    hidden: true,
    execute(message = new Discord.Message, args = []){
        // Tän kuuluis asettaa kanava minne anouncee paskaa mut en o täysin varma minne se tallentaa, varmaa sql mut en jaska ny tehä lol
    }
}