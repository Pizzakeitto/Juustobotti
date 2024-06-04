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

        const hash = MurmurHash3(message.content.toLowerCase())

        const rating = Math.floor(SimpleFastCounter32(hash) * 11) // 11 to include 10
        let randomMsg = msgs[Math.floor(SimpleFastCounter32(hash) * msgs.length)]

        randomMsg = randomMsg.replace("%", rating)
        if(randomMsg.includes("$")) {
            return message.channel.send(randomMsg.replace("$", args.join(' ')))
        } else if(randomMsg.includes("£")) {
            return message.channel.send(randomMsg.replace("£", args.join(' ').toUpperCase()))
        }
    }
}

// Borrowed from https://www.delftstack.com/howto/javascript/javascript-random-seed-to-generate-random/
// Thanks <3
function MurmurHash3(string) {
    let i = 0;
    for (i, hash = 1779033703 ^ string.length; i < string.length; i++) {
      let bitwise_xor_from_character = hash ^ string.charCodeAt(i);
      hash = Math.imul(bitwise_xor_from_character, 3432918353);
      hash = hash << 13 | hash >>> 19;
    }

    hash = Math.imul(hash ^ (hash >>> 16), 2246822507);
    hash = Math.imul(hash ^ (hash >>> 13), 3266489909);
    return (hash ^= hash >>> 16) >>> 0;
  }
  
  function SimpleFastCounter32(seed_1, seed_2, seed_3, seed_4) {
    seed_1 >>>= 0;
    seed_2 >>>= 0;
    seed_3 >>>= 0;
    seed_4 >>>= 0;
    let cast32 = (seed_1 + seed_2) | 0;
    seed_1 = seed_2 ^ seed_2 >>> 9;
    seed_2 = seed_3 + (seed_3 << 3) | 0;
    seed_3 = (seed_3 << 21 | seed_3 >>> 11);
    seed_4 = seed_4 + 1 | 0;
    cast32 = cast32 + seed_4 | 0;
    seed_3 = seed_3 + cast32 | 0;
    return (cast32 >>> 0) / 4294967296;
  }
  