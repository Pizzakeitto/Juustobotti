const Discord = require('discord.js')
const { getUser } = require('../../utils/mongoUtils')
const { currency } = require('../../config.json')
module.exports = {
    name: 'blackjack',
    aliases: ['bj'],
    description: 'Play a game of blackjack!',
    detailedDescription: 'You can feed your crippling gambling addiction by using this command. Bets do nothing atm :pensive:',
    usage: 'blackjack [bet]',
    // For intellisense purposes i need the new Discord.Message n stuff :)
    async execute(message = Discord.Message.prototype, args = [""]) {
        if(!args[0]) {
            return message.channel.send("You didnt tell your bet!")
        }
        if(isNaN(args[0])) return message.channel.send("Your bet has to be a number!")
        let bet = Number(Number(args[0]).toFixed(2))
        if(bet < 0) return message.channel.send("Sorry bro, no free money for you")
        if(bet >= Infinity) return message.channel.send("Sorry bro, i dont think you can have infinite money")


        const user = await getUser(message.author.id)
        if(user.wallet < bet) return message.channel.send(`Sorry bro, you cant afford gambling (You have ${user.wallet}${currency} in your pockets rn)`)
        
        // IF we are here the dood has enoug hmoney
        // We remove the money so yes
        user.wallet -= bet
        await user.save()

        let playerCards = []
        let dealerCards = []
        
        // Card drawing
        playerCards.push(pickCard())
        playerCards.push(pickCard())
        // The values below are for rigging the player (for testing purposes)
        // playerCards.push(1)
        // playerCards.push(10)
        dealerCards.push(pickCard())

        let playerSum = playerCards.reduce((a, b) => a + b, 0)
        let dealerSum = dealerCards.reduce((a, b) => a + b, 0)
        if (playerCards.includes(1) && playerSum + 10 <= 21) {
            playerSum += 10
        }

        const colors = {
            lose: 0xFF2727,     // red
            win: 0x27FF27,      // green
            playing: 0xFF27FF,  // pink
            standby: 0x6060ff,  // blue
        }

        let embed = {
            color: colors.playing,
            title: 'BLACKJACK',
            description: `You have bet ${bet}${currency}`,
            fields: [
                {
                    name: `${message.author.username}`,
                    value: `**Cards:** ${playerCards.join(", ")}` +
                    `\n**Total:** ${playerSum}`
                },
                {
                    name: 'The dealer™',
                    value: `**Cards:** ${dealerCards.join(", ")}, x` +
                    `\n**Total:** ${dealerSum}`

                },
            ],
            footer: {
                text: 'Type \'h\' to hit and \'s\' to stand!'
            }
        }
        
        // Check if player got blackjack already
        if (playerCards.includes(1) && playerCards.includes(10)) {
            embed.color = colors.win
            embed.footer.text = `You got blackjack!`
            message.channel.send({embeds: [embed]})
            message.channel.send(`You got blackjack, instant win! ${bet * 5}${currency} for you, you lucky person`)
            user.wallet += bet * 5
            await user.save()
            return
        }
        message.channel.send({embeds: [embed]}).then(botmsg => {
            playerPlay(message, botmsg)
        })
        
        // This is a recursive function, so player keeps playing until bust or stand
        function playerPlay(message = new Discord.Message, botmsg = new Discord.Message) {
            let filter = m => m.author.id === message.author.id
            message.channel.awaitMessages({filter, 
                max: 1,
                time: 60000,
                errors: ['time']
            }).then(message => {
                message = message.first()
                if (message.content.toLowerCase() == 'h') {
                    playerCards.push(pickCard())
                    playerSum = playerCards.reduce((a, b) => a + b, 0)
                    if (playerCards.includes(1) && playerSum + 10 < 21) {
                        playerSum += 10
                    }

                    embed.fields[0].value = `**Cards:** ${playerCards.join(", ")}` +
                    `\n**Total:** ${playerSum}`

                    if (playerSum > 21) {
                        embed.color = colors.lose
                        embed.footer.text = 'You busted!'
                        botmsg.edit({embeds: [embed]})
                        gameover()
                    } else {
                        botmsg.edit({embeds: [embed]})
                        playerPlay(message, botmsg)
                    }
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
            if (dealerCards.includes(1) && dealerSum + 10 <= 21) {
                dealerSum += 10
            }

            if (dealerCards.length == 2 && dealerCards.includes(1) && dealerCards.includes(10)) {
                embed.footer.text = 'GAME OVER'
                embed.color = colors.lose
                embed.fields[1].value = `**Cards:** ${dealerCards.join(", ")}` +
                `\n**Total:** ${dealerSum}`

                botmsg.edit({embeds: [embed]})
                message.channel.send(`The dealer got a blackjack and you lost ${bet}${currency}!`)
                gameover()
                return
            }

            embed.fields[1].value = `**Cards:** ${dealerCards.join(", ")}` +
            `\n**Total:** ${dealerSum}`
            embed.footer.text = 'The dealer is picking cards...'
            embed.color = colors.standby

            botmsg.edit({embeds: [embed]})
            if(dealerSum < 17) {
                setTimeout(function () {
                    dealerPlay(message, botmsg)
                }, 500)
            }
            else {
                setTimeout(function () {
                    if(playerSum == dealerSum) {
                        embed.footer.text = 'Draw!'
                        botmsg.edit({embeds: [embed]})
                        message.channel.send(`It's a draw! (You got your ${bet}${currency} back)`)
                        user.wallet += bet
                        gameover()
                    }
                    else if(playerSum >= dealerSum || dealerSum >= 22) {
                        embed.footer.text = 'You win!'
                        embed.color = colors.win
                        botmsg.edit({embeds: [embed]})
                        message.channel.send(`You won ${bet * 2}${currency} !`)
                        user.wallet += bet * 2
                    } else {
                        embed.footer.text = 'Dealer wins!'
                        embed.color = colors.lose
                        botmsg.edit({embeds: [embed]})
                        message.channel.send(`Oof you lost ${bet}${currency} :(`)
                        gameover()
                    }
                    console.log(`saved doods money, has ${user.wallet} now`)
                    user.save()
                }, 500)
            }
        }
        function pickCard() {
            const availCards = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 10, 10, 10]
            return availCards[Math.floor(Math.random() * availCards.length)]
        }

        // annoying people is fun :)
        async function gameover() {
            let listOfAnnoyances = [
                "lol git gud first",
                "how bout you get good before calling the game rigged",
                "dude, get good",
                "skill issue",
                "not my problem you cant play",
                "BWHAHAHAHAHHAHAHAHAHAHAAAHAHHAHAH XXXDXXDDXDXDDDDDDXDDDDXXDXDDDDDDDDXDXDXDDXDXDXDDDDXXDXXDXDDDXDDXDXDD RIGGED????!?!?!?!?!??!?!???!?!!??!?? DXDXDXFDXXDDXDXDXDXDXDXDXDXDXDXDXXDXDXDXDDXXDXXXXDDXDXDXXDDDXXDXDXDD git gud",
                "brah go to gambling school or somthing smh",
                "ping pizzakeitto if you dont know what youre doing and stop blaming me (unless you losing was my fault lol)",
                "noob"
            ]
            let alreadySent = []
            const filter = m => m.author.id == message.author.id && m.content.includes("rigg")
            message.channel.createMessageCollector({max: 5, time: 60000, filter}).on("collect", (msg) => {
                console.log(`nice, ${msg}`)
                const index = Math.floor(Math.random() * listOfAnnoyances.length)
                const annoyanceOfTheDay = listOfAnnoyances[index]
                msg.channel.send(annoyanceOfTheDay)
                listOfAnnoyances.splice(index, 1) // remove from the list so no duplicates get sent
            })
        }
    }
}