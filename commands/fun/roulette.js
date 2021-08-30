const Discord = require('discord.js');
module.exports = {
    name: 'roulette',
    description: 'Play a game of roulette!',
    execute(message = new Discord.Message, args = [""]) {
        // if no args gtfo
        // if(args[0] == '') return message.channel.send('What you rouletting on? (its either a number or a color)')
        var redNumbers   = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]
        var blackNumbers = [2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35]

        // Check if all numbers exist
        var numbers = ''
        for (var i = 0; i < 18; i++) {
            if(redNumbers[i] < blackNumbers[i]) {
                numbers += `${redNumbers[i]} `
                numbers += `${blackNumbers[i]} `
            } else {
                numbers += `${blackNumbers[i]} `
                numbers += `${redNumbers[i]} `
            }
        }

        console.log(numbers)
    }
}