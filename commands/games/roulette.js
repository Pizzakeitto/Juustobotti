const Discord = require('discord.js')
module.exports = {
    name: 'roulette',
    description: 'Play a game of roulette!',
    detailedDescription: 'You can feed your crippling gambling addiction by using this command.',
    usage: 'roulette [your guess]',
    execute(message = new Discord.Message, args = [""]) {
        // if no args gtfo
        if(args.length == 0) return message.channel.send('What you rouletting on? (its either a number or a color)')

        let bet = args[0]
        function send(msg) {
            message.channel.send(msg)
        }

        let redNumbers   = ['1', '3', '5', '7', '9', '12', '14', '16', '18', '19', '21', '23', '25', '27', '30', '32', '34', '36']
        let blackNumbers = ['2', '4', '6', '8', '10', '11', '13', '15', '17', '20', '22', '24', '26', '28', '29', '31', '33', '35']

        let validChoises = []
        validChoises.push('0')
        redNumbers.forEach(number => validChoises.push(number))
        blackNumbers.forEach(number => validChoises.push(number))
        validChoises.push('red')
        validChoises.push('black')
        validChoises.push('green') // same as 0
        // console.log(validChoises)

        let startTimeMS = 0
        // process.env.rouletteTimer <- replaces let timerID
        console.log(`timerid alkuun on ${process.env.rouletteTimer}`)
        let timerStep = 10000

        if(validChoises.includes(bet.toLowerCase())) {
            if(process.env.rouletteTimer == undefined) startTimer()
            else return message.channel.send('There is already a game going! (you joined tho i think)')
            console.log(`timerid startin jälkeen on ${process.env.rouletteTimer}`)
            send(`OK You put your life on ${bet}! Good luck! (Game doesnt starts in ${timerStep/1000})`)
        } else message.channel.send(`Not a valid choice.`)

        function randomNumber(){
            return Math.floor(Math.random() * 36).toString()
        }

        
        function startTimer(){
            startTimeMS = new Date().getTime // https://stackoverflow.com/questions/3700200/how-to-find-the-remaining-time-of-a-settimeout
            process.env.rouletteTimer = setTimeout(roll, timerStep)
        }

        function roll(){
            clearTimeout(process.env.rouletteTimer)
            delete(process.env.rouletteTimer)
            let endNumber = randomNumber()
            let result
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