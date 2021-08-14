const Discord = require('discord.js');

module.exports = {
    name: 'announce',
    description: 'Announce some important message to some channel',
    usage: '<message>',
    hidden: true,
    execute(message = new Discord.Message, args = []){
        if(!args){
            return message.channel.send("bruh what do i announce???")
        }

        const {prefix} = require('../../config.json');
        var msg = message.content.slice(prefix.length + 8).trim();

        if(message.member.hasPermission('MANAGE_CHANNELS')) {
            message.client.channels.cache.get('733451782587416648').send(msg)
        } else message.channel.send('Sorry you dont have perms lol')
    }
}