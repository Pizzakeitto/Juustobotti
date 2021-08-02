const Discord = require('discord.js')
module.exports = {
    name: 'hauku',
    description: 'Haukkuu jotain tyyppiä brutaalisti',
    execute(message = new Discord.Message, args = []){
        if( !(message.mentions.members.first()) ){
            message.reply('Lol kerro ketä haukun');
            return;
        }
        let mentionedUser = message.mentions.members.first();
        let haukut = ['Oot kakka', 'Hau hau', 'Mau mau'];
        let haukku = haukut[Math.floor(Math.random() * haukut.length)]




        message.channel.send(`${haukku} ${mentionedUser}`)
        message.delete()
    }
}