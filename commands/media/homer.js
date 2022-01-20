const Discord = require('discord.js')

module.exports = {
    name: 'homer',
    description: 'homer',
    detailedDescription: 'iha ok, mut ootko kattonu simpsonit sarjasta jakson himo läski homer :D siinä esiintyy koko simpsonit perhe eli myös bart simpsons homer poika fanit saavat nauraa ja naurattaahan se tietty myös vaikka homerin läski kuteet ja muut :D kannattaa kattoo nopee',
    execute(message = new Discord.Message, args = [""]) {
        const voicechannel = message.member.voice.channel
        if (!voicechannel) return message.reply('You need to join a voice channel first!')
        
        voicechannel.join().then(connection => {
            const dispatcher = connection.play(`${__dirname}/../../homer.mp3`)
            message.react('✅')
            dispatcher.on("close", close => {
                voicechannel.leave()
            })
        })
    }
}