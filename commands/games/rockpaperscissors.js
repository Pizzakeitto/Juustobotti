const Discord = require('discord.js')

module.exports = {
    name: 'rps',
    description: 'play a gmae of rock paper scissors',
    execute(message = new Discord.Message, args = []){
        const brain = require('brain.js')

        // Initial stats
        let playerPoints = 0
        let botPoints = 0
        let round = 0
 
        let playerChoise = -1
        let botChoise = -1

        // the ai
        const rpsAI = new brain.recurrent.LSTMTimeStep({
            hiddenLayers: [25]
        })

        // Randomly generate the initial values for the AI to munch on (random numbers from 1 to 3)
        // 1 = rock
        // 2 = paper
        // 3 = scissors
        let randomInputs = []
        for (let x = 0; x<10; x++){
            randomInputs.push(Math.floor(Math.random()*3+1))
        }

        // Train the AI using these initial values
        rpsAI.train([randomInputs], {log:false, errorThresh: 0.02, iterations: 500})
        // console.log(`The options for this ai: ${JSON.stringify(rpsAI.options, null, 2)}`)
        // botChoise = Math.round(rpsAI.run(inputs))
        // botChoise < 0 ? botChoise++ : botChoise
        // botChoise > 3 ? botChoise-- : botChoise

        // put everything in a map for ease
        // After coding this command i realized that i dont really know how to use maps properly :D:D:DDD
        // Could've used something else for this
        let stats = new Map()
        stats.set("playerPoints", playerPoints)
        stats.set("botPoints", botPoints)
        stats.set("round", round)
        stats.set("playerChoise", playerChoise)
        stats.set("botChoise", botChoise)
        stats.set("inputs", randomInputs)

        // The emojis ids btw:
        // rock : 915328258126528582
        // paper : 915328929294864494
        // scissors : 915329041958043648

        // make the embed
        let gameEmbed = new Discord.MessageEmbed()
        gameEmbed.setColor(0x00f000) // green ish
        gameEmbed.setTitle("Rock Paper Scissors!!!!!")
        gameEmbed.setDescription(`Round ${round} of rock paper scissors with ${message.author.username}! \nThe game will timeout after 2 minutes of inactivity.`)
        gameEmbed.addField("Your wins:", playerPoints.toString(), true)
        gameEmbed.addField("Bot's wins:", botPoints.toString(), true)
        gameEmbed.addField("**place**","**holder**", false) // blank to set another line
        gameEmbed.addField("You chose...", numToThing(playerChoise), true)
        gameEmbed.addField("Bot chose...", numToThing(botChoise), true)
        gameEmbed.setFooter("Game about to start... Pick your poison!")

        message.channel.send({embeds: [gameEmbed]}).then(async (gameMsg) => {
            let rockEmoji      =    message.client.emojis.cache.get('915328258126528582')
            let paperEmoji     =    message.client.emojis.cache.get('915328929294864494')
            let scissorsEmoji  =    message.client.emojis.cache.get('915329041958043648')
            await gameMsg.react(rockEmoji)
            await gameMsg.react(paperEmoji)
            await gameMsg.react(scissorsEmoji)

            play(gameMsg, gameEmbed, stats)
        })

        async function play(gameMsg = new Discord.Message, gameEmbed = new Discord.MessageEmbed, stats = new Map) {
            // extract things from stats to make things easier
            let playerPoints = stats.get("playerPoints")
            let botPoints = stats.get("botPoints")
            let round = stats.get("round")
            let playerChoise = stats.get("playerChoise")
            let botChoise = stats.get("botChoise",)
            let inputs = stats.get("inputs")

            round++
            
            const filter = (reaction, user) => user.id == message.author.id && ['915328258126528582', '915328929294864494', '915329041958043648'].includes(reaction.emoji.id)
            const reactions = await gameMsg.awaitReactions({filter, time: 120000, max: 1})
            if(reactions.equals(new Discord.Collection)) {
                // If no reactions were found from the user, stop the game
                // This happens only when the waiting has ran out
                gameEmbed.setColor(0xa00000)
                gameEmbed.setFooter("The game ended, GG!")
                gameMsg.edit({embeds: [gameEmbed]})
                return
            }
            const reaction = reactions.first()

            let input = thingToNum(reaction.emoji.name) // reaction.emoji.name is gon be either "rock", "paper" or "scissors"
            if (isNaN(input)) return message.channel.send("Some bizzare error occurred!") // If not a number something broke!

            botChoise = Math.round(rpsAI.run(inputs)) // predict what the user will pick
            // console.log(`Predicted ${rpsAI.run(inputs)} with these inputs: ${inputs.join(', ')}`)

            botChoise = chooseWinningNumber(botChoise) // choose how to win

            playerChoise = thingToNum(reaction.emoji.name) // example: convert "rock" to 1

            // choose the winner
            let botwin = false
            let tie = false
            if (input == 1 && botChoise == 2) botwin = true
            if (input == 2 && botChoise == 3) botwin = true
            if (input == 3 && botChoise == 1) botwin = true
            if (input == botChoise) tie = true

            tie ? null : botwin ? botPoints++ : playerPoints++
            
            // edit the embed to display results
            gameEmbed.setDescription(`Round ${round} of rock paper scissors with ${message.author.username}! \nThe game will timeout after 2 minutes of inactivity.`)
            gameEmbed.fields = [] // lazy
            gameEmbed.addField("Your wins:", playerPoints.toString(), true)
            gameEmbed.addField("Bot's wins:", botPoints.toString(), true)
            gameEmbed.addField("**place**","**holder**", false) // blank to set another line
            gameEmbed.addField("You chose...", numToThing(playerChoise), true)
            gameEmbed.addField("Bot chose...", numToThing(botChoise), true)
            gameEmbed.setFooter(tie ? "It's a tie! Keep playing?" : botwin ? "Bot won! Keep playing?" : "You won! Keep playing?")
            gameMsg.edit({embeds: [gameEmbed]})

            // now we can add the input to the list of inputs, and train the AI to make the next guess
            inputs.push(input)
            inputs.shift()
            rpsAI.train([inputs], {log:false, logPeriod: 500, errorThresh: 0.01, iterations: 2000})
            await sleep(500)

            // save inputs for later
            stats.set("playerPoints", playerPoints)
            stats.set("botPoints", botPoints)
            stats.set("round", round)
            stats.set("playerChoise", playerChoise)
            stats.set("botChoise", botChoise)
            stats.set("inputs", randomInputs)
            await reaction.users.remove(message.author) // remove users reaction to indicate the bot is ready for the next round
            play(gameMsg, gameEmbed, stats)
        }
        
        function numToThing(num = new Number){
            switch(num) {
                case 1: 
                    return "Rock"
                case 2:
                    return "Paper"
                case 3:
                    return "Scissors"
                case -1:
                    return "nothing yet lol"
                default:
                    return num // shouldnt happen
            }
        }

        function thingToNum(thing = new String){
            switch(thing) {
                case "rock":
                    return 1
                case "paper":
                    return 2
                case "scissors":
                    return 3
                default:
                    console.log("!!!!!! thingToNum() HAD TO DEFAULT FOR SOME REASON??? Heres the value given: " + thing)
                    return thing // this was not supposed to happen
            }
        }

        function chooseWinningNumber(num = new Number) {
            switch(num){
                case 1:
                    return 2
                case 2:
                    return 3
                case 3:
                    return 1
                default:
                    return num // shouldnt really happen
            }
        }

        // Thanks https://www.sitepoint.com/delay-sleep-pause-wait/ !!
        function sleep(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }
    }
}