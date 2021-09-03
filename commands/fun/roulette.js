const Discord = require('discord.js');
module.exports = {
    name: 'roulette',
    description: 'Play a game of roulette!',
    execute(message = new Discord.Message, args = [""]) {
        // if no args gtfo
        if(args[0] == null) return message.channel.send('What you rouletting on? (its either a number or a color)')

        var bet = args[0]
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
        validChoises.push('green') // same as 0
        // console.log(validChoises)

        var startTimeMS = 0
        var timerID;
        console.log(`timerid alkuun on ${timerID}`)
        var timerStep = 1000

        if(validChoises.includes(bet.toLowerCase())) {
            if(timerID == undefined) startTimer()
            else return message.channel.send('There is already a game going! (you joined tho i think)')
            console.log(`timerid startin jälkeen on ${timerID}`)
            send(`OK You put your life on ${bet}! Good luck! (Game doesnt starts in ${timerStep/1000})`)
        }

        function randomNumber(){
            return Math.floor(Math.random() * 36).toString()
        }

        
        function startTimer(){
            startTimeMS = new Date().getTime // https://stackoverflow.com/questions/3700200/how-to-find-the-remaining-time-of-a-settimeout
            timerID = setTimeout(roll, timerStep)
        }

        function roll(){
            clearTimeout(timerID)
            var endNumber = randomNumber()
            var result;
            if(endNumber == bet || (bet.toLowerCase() == 'green' && endNumber == 0)){
                result = 'You won a lot of money and spaghetti!!'
            } else if(bet.toLowerCase() == 'red' && redNumbers.includes(endNumber)){
                result = 'You won because red !!!'
            } else if(bet.toLowerCase() == 'black' && blackNumbers.includes(endNumber)){
                result = 'You won because black !!!'
            } else {
                result = 'I think you lost?'
            }
            message.channel.send(`The ball landed on ${endNumber}! ` + result)
        }

    }
}