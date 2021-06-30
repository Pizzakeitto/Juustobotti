const Discord = require('discord.js');
module.exports = {
    name: 'bj',
    description: 'Play a game of blackjack!',
    // Täs execute hommas kokeilin castaa nää sampit et saa intellisense fiksusti, toimii iha ok
    execute(message = new Discord.Message, args = [""]) {
        var playerCards = []
        var dealerCards = []
        
        playerCards.push(pickCard())
        playerCards.push(pickCard())
        dealerCards.push(pickCard())

        var playerSum = playerCards.reduce((a, b) => a + b, 0)
        var dealerSum = dealerCards.reduce((a, b) => a + b, 0)
        if (playerCards.includes(1) && playerSum + 10 < 21) {
            playerSum += 10;
        }
        if (playerCards.includes(1) && playerCards.includes(10)) {
            message.channel.send(`Sun kortit on ${playerCards.join(", ")}. Tuli blackjack lol eli voitit nice job`)
            return;
        }
        message.channel.send(`Sun kortit on ${playerCards.join(", ")}, joka tekee ${playerSum} yhteensä.\nDealerilla on ${dealerCards}, x.\nMikä on sun pro gamer move? Kirjota\nh lyödäkses, ja\ns seisoakses`).then(botmsg => {
            playerPlay(message, botmsg)
        })
        
        function playerPlay(message = new Discord.Message, botmsg = new Discord.Message) {
            let filter = m => m.author.id === message.author.id
            message.channel.awaitMessages(filter, {
                max: 1,
                time: 60000,
                errors: ['time']
            }).then(message => {
                message = message.first()
                if (message.content.toLowerCase() == 'h') {
                    playerCards.push(pickCard())
                    playerSum = playerCards.reduce((a, b) => a + b, 0)
                    if (playerCards.includes(1) && playerSum + 10 < 21) {
                        playerSum += 10;
                    }
                    botmsg.edit(`Sun kortit on ${playerCards.join(", ")}, joka tekee ${playerSum} yhteensä.\nDealerilla on ${dealerCards}, x.\n${playerSum > 21 ? 'BUSTASIT!' : 'Mikä on sun pro gamer move? Kirjota\nh lyödäkses, ja\ns seisoakses'}`)
                    if (playerSum > 21) return;
                    playerPlay(message, botmsg)
                } else if (message.content.toLowerCase() == "s") {
                    // bot pelaa
                    
                } else {
                    message.channel.send("Väärä vastaus? lähetä joko h tai s")
                    playerPlay(message, botmsg)
                }
            })
        }

        function dealerPlay(message = new Discord.Message, botmsg = new Discord.Message) {
            dealerCards.push(pickCard())
            dealerSum = dealerCards.reduce((a, b) => a + b, 0)
            botmsg.edit(`Sun kortit on ${playerCards.join(", ")}, joka tekee ${playerSum} yhteensä.\nDealerilla on ${dealerCards.join(", ")}, joka tekee ${dealerSum} yhteensä.'}`)

        }
        function pickCard() {
            // Monta 10 koska J Q K
            const availCards = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 10, 10, 10]
            return availCards[Math.floor(Math.random() * availCards.length)]
        }
    }
}