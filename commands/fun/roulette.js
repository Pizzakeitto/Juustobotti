const Discord = require('discord.js');
module.exports = {
    name: 'roulette',
    description: 'Play a game of roulette!',
    execute(message = new Discord.Message, args = [""]) {
        // if no args gtfo
        if(args[0] == null) return message.channel.send('What you rouletting on? (its either a number or a color)')

        function send(msg) {
            message.channel.send(msg)
        }

        var redNumbers   = ['1', '3', '5', '7', '9', '12', '14', '16', '18', '19', '21', '23', '25', '27', '30', '32', '34', '36']
        var blackNumbers = ['2', '4', '6', '8', '10', '11', '13', '15', '17', '20', '22', '24', '26', '28', '29', '31', '33', '35']

        var validChoises = []
        validChoises.push('0')
        redNumbers.forEach(number => validChoises.push(number))
        blackNumbers.forEach(number => validChoises.push(number))
        validChoises.push('red')
        validChoises.push('black')
        console.log(validChoises)

        var startTimeMS = 0

        if(validChoises.includes(args[0].toLowerCase())) {
            startTimer(timer)
            send(`OK You put your life on ${args[0]}! Good luck! (Game starts in ${timer})`)
        }

        function randomNumber(){
            return Math.floor(Math.random() * 36)
        }

        function startTimer(timer){
            startTimeMS = new Date().getTime // https://stackoverflow.com/questions/3700200/how-to-find-the-remaining-time-of-a-settimeout
        }
    }
}