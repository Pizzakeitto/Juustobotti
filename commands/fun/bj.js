const Discord = require('discord.js');
module.exports = {
    name: 'bj',
    description: 'Play a game of blackjack!',
    // For intellisense purposes i need the new Discord.Message n stuff :)
    execute(message = new Discord.Message, args = [""]) {
        if(!args[0]) {
            return message.channel.send("You didnt tell your bet!")
        } else var ogbet = args.join(' ')

        if(!isNaN(ogbet)) var bet = ogbet + ' :dollar:'
        else var bet = ogbet

        message.channel.send(`You put ${bet} in the game!`)

        var playerCards = []
        var dealerCards = []
        
        // Card drawing
        playerCards.push(pickCard())
        playerCards.push(pickCard())
        // The values below are for rigging the player (for testing purposes)
        // playerCards.push(1)
        // playerCards.push(10)
        dealerCards.push(pickCard())

        var playerSum = playerCards.reduce((a, b) => a + b, 0)
        var dealerSum = dealerCards.reduce((a, b) => a + b, 0)
        if (playerCards.includes(1) && playerSum + 10 < 21) {
            playerSum += 10;
        }
        if (playerCards.includes(1) && playerCards.includes(10)) {
            message.channel.send(`You have ${playerCards.join(", ")}. You got a blackjack = instant win spaghetti noodle !!!! (and you got ${isNaN(ogbet) ? ogbet + ' * 3' : ogbet*3})`)
            return;
        }
        message.channel.send(`You have ${playerCards.join(", ")}, which is ${playerSum} in total.\nThe dealer has ${dealerCards}, x.\nWhat's your pro gamer move? Type\nh to hit, and\ns to stand`).then(botmsg => {
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
                    botmsg.edit(`You have ${playerCards.join(", ")}, which is ${playerSum} in total.\nThe dealer has ${dealerCards}, x.\n${playerSum > 21 ? 'BUST!' : 'nWhat\'s your pro gamer move? Type\nh to hit, and\ns to stand'}`)
                    if (playerSum > 21) return;
                    playerPlay(message, botmsg)
                } else if (message.content.toLowerCase() == "s") {
                    // bot plays
                    dealerPlay(message, botmsg)
                } else {
                    message.channel.send("That isn't an option. h to hit and s to stand.")
                    playerPlay(message, botmsg)
                }
            })
        }

        function dealerPlay(message = new Discord.Message, botmsg = new Discord.Message) {
            dealerCards.push(pickCard())
            dealerSum = dealerCards.reduce((a, b) => a + b, 0)
            if (dealerCards.includes(1) && dealerSum + 10 < 21) {
                dealerSum += 10;
            }
            if (dealerCards.includes(1) && dealerCards.includes(10)) {
                message.channel.send(`You have ${playerCards.join(", ")}. The dealer got a blackjack = instant lose spaghetti noodle !!!! (and you lost ${isNaN(ogbet) ? ogbet + ' * 3' : ogbet*3})`)
                return;
            }
            botmsg.edit(`You have ${playerCards.join(", ")}, which is ${playerSum} in total.\nThe dealer has ${dealerCards.join(", ")}, which is ${dealerSum} in total.`)
            if(dealerSum < 17) {
                setTimeout(function () {
                    dealerPlay(message, botmsg)
                }, 1000);
            }
            else {
                setTimeout(function () {
                    if(playerSum == dealerSum) {
                        message.channel.send(`It's a draw! (You got your ${bet} back)`)
                    }
                    else if(playerSum >= dealerSum || dealerSum >= 22) {
                        message.channel.send(`You won ${isNaN(ogbet) ? ogbet + ' * 2' : ogbet*2} !`)
                    } else message.channel.send(`Oof you lost ${bet} :(`)
                }, 500)
            }
        }
        function pickCard() {
            const availCards = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 10, 10, 10]
            return availCards[Math.floor(Math.random() * availCards.length)]
        }
    }
}