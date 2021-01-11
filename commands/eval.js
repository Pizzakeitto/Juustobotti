module.exports = {
    name: 'eval',
    description: 'Evaluate code from mesag',
    execute(message, args){
        if(!args){
            return message.channel.send("Nothing to eval!")
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