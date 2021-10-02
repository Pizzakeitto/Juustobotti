module.exports = {
    name: 'roll',
    description: 'get random number yes',
    execute(message, args){
        function getRandomBetween(max) {
            return Math.random() * (max - 0) + 0;
        }
        var number = getRandomBetween(100);
        message.channel.send(`You got ${Math.floor(number)}`);
    }
}