const Discord = require('discord.js')

module.exports = {
    name: 'eurobeat',
    description: 'eurobeat',
    execute(message = new Discord.Message, args = [""]) {
        const voicechannel = message.member.voice.channel
        if (!voicechannel) return message.reply('You need to join a voice channel first!')

        main()

        async function main(){
            let connection = await voicechannel.join()
            message.react('✅')
            message.channel.send('Pls enjoy eurobeat')
            const dispatcher = connection.play("http://165.227.19.100:9001/listen.aac") // Eurobeat radio, https://idforums.net/
        }
    }
}