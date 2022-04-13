const Discord = require('discord.js')

module.exports = {
    name: 'rate',
    description: 'Rate something',
    detailedDescription: 'This command will rate something 100% accurately! (pls dont take it seriously) Just give me something to rate and I\'ll do it.',
    execute(message = Discord.Message.prototype, args = [""]) {
        if (args.length == 0) return message.channel.send("You didn't give me anything to rate! 0/10")
        // $ - The thing to rate
        // £ - The thing to rate, in uppercase
        // % - The rating
        const msgs = [
            "Hmm... I'll rate $ a solid %/10",
            "OH £ HELL YEAH!!!! ILL GIVE IT %/10",
            "$ is definitely a %/10 in my opinion",
            "Damn $ suck so bad ill rate it %/10",
            "I loooooooooooooooove $ so much but also have my problems with it, so %/10.",
            "$. %/10. 😎",
            "LETSGOOOOO £!!!!!!!!!!!!!! %/10!!!!!!!!!!!!!!!!!!!!!!!!!",
            "Wtf is a $? Idk ill give it %/10 anyways.",
            "I'd rather pour milk down the drain than to have anything do with $. %/10"
        ]

        const rating = Math.floor(Math.random() * 11) // 11 to include 10
        let randomMsg = msgs[Math.floor(Math.random() * msgs.length)]

        randomMsg = randomMsg.replace("%", rating)
        if(randomMsg.includes("$")) {
            return message.channel.send(randomMsg.replace("$", args.join(' ')))
        } else if(randomMsg.includes("£")) {
            return message.channel.send(randomMsg.replace("£", args.join(' ').toUpperCase()))
        }
    }
}