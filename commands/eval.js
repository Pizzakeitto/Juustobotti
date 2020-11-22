module.exports = {
    name: 'eval',
    description: 'Evaluate code from mesag',
    execute(message, args){
        if(!args){
            return message.channel.send("No arguments given!")
        }
        const prefix = process.env.PREFIX;
        var newargs = message.content.slice(prefix.length + 4).trim();

        console.log(newargs);
        try {
            message.channel.send(eval(`${newargs}`));
        } catch (error){
            message.channel.send(`Didnt work: ${error}`);
        }
    }
}