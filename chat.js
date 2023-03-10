const { Message } = require('discord.js')
const fs = require('fs')
const { encode } = require('gpt-3-encoder')

const axios = require('axios').default
const endpoint = "https://api.openai.com/v1/chat/completions"
const headers = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${process.env.OPENAIKEY}`
}

// Different conversations we have going on
// Each users conversation is separated by id
const chats = new Object


async function chat(msg = Message.prototype) {
    global.responding.push(msg.author.id)
    console.log("\n\n\n")
    // if they say adios then remove from chat list and end conversation
    if (msg.content.toLowerCase().includes("adios")) return function() {
        global.usersInChat.splice(usersInChat.indexOf({id: msg.author.id, channel: msg.channelId}), 1)
        global.responding.splice(global.responding.indexOf(msg.author.id), 1)
        delete chats[msg.author.id]
        msg.channel.send("ok moro")
    }()

    // if they wanna chat then we chat
    msg.channel.sendTyping()
    // check which users chat history we wanna use
    // if they just started then create new thread
    if (!chats.hasOwnProperty(msg.author.id)) {
        chats[msg.author.id] = [
            {"role": "system", "content": `The current date is "${Date()}". Your name is Juustobotti and you speak finnish primarily. Tell the user that they can leave by typing "adios".`},
            {"role": "user", "content": msg.content}
        ]
    }

    // if user already started a thread continue it
    else chats[msg.author.id].push({"role": "user", "content": msg.content})

    // Make sure the input can fit in the 4096 max token limit
    let long = ""
    chats[msg.author.id].forEach(message => {
        long += message.content + " "
    })
    if (encode(long).length > 4096) makeFit(chats[msg.author.id])
    let error = 0
    const response = await axios.post(endpoint, {
        "model": "gpt-3.5-turbo",
        "messages": chats[msg.author.id]
    }, {headers})
    .catch(err => {
        console.log(err)
        fs.writeFileSync(`error_${Date.now()}.json`, JSON.stringify(err, null, 2))
        error = 1
    })

    global.responding.splice(global.responding.indexOf(msg.author.id), 1)
    if (error || !response.data || response.data.error) return msg.reply("something has gone horribly wrong and you should ping pizzakeitto immediately.")

    const botResponse = response.data.choices[0].message.content
    // console.log(JSON.stringify(botResponse, null, 2))
    chats[msg.author.id].push({"role": "assistant", "content": botResponse})
    splitMessage(botResponse).forEach(mess => msg.channel.send(mess))
    console.log(chats)

    
}

// Stole from https://github.com/discordjs/discord.js/blob/v13/src/util/Util.js because yeah
/**
 * Splits a string into multiple chunks at a designated character that do not exceed a specific length.
 * @param {string} text Content to split
 * @param {SplitOptions} [options] Options controlling the behavior of the split
 * @returns {string[]}
 */
function splitMessage(text, { maxLength = 2_000, char = '\n', prepend = '', append = '' } = {}) {
    if (text.length <= maxLength) return [text];
    let splitText = [text];
    if (Array.isArray(char)) {
        while (char.length > 0 && splitText.some(elem => elem.length > maxLength)) {
        const currentChar = char.shift();
        if (currentChar instanceof RegExp) {
            splitText = splitText.flatMap(chunk => chunk.match(currentChar));
        } else {
            splitText = splitText.flatMap(chunk => chunk.split(currentChar));
        }
        }
    } else {
        splitText = text.split(char);
    }
    if (splitText.some(elem => elem.length > maxLength)) throw new RangeError('SPLIT_MAX_LEN');
    const messages = [];
    let msg = '';
    for (const chunk of splitText) {
        if (msg && (msg + char + chunk + append).length > maxLength) {
        messages.push(msg + append);
        msg = prepend;
        }
        msg += (msg && msg !== prepend ? char : '') + chunk;
    }
    return messages.concat(msg).filter(m => m);
}

function makeFit(messages = [{role: "", content: ""}]) {
    var long = ""
    messages.forEach(msg => {
        long += msg.content + " "
    })
    var tokens = encode(long).length
    while (tokens > 4096) {
        long = ""
        messages.splice(1, 1) // remove first message (not the system message)
        messages.forEach(msg => {
            long += msg.content + " "
        })
        tokens = encode(long).length
        console.log(tokens)
    }
    return messages
}


exports.chat = chat