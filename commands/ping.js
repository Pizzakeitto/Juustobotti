module.exports = {
	name: 'ping',
	description: 'Ping!',
	execute(message, args) {
        var ping = Date.now() - message.createdTimestamp + " ms";
        message.channel.send("Bot's ping is `" + `${Date.now() - message.createdTimestamp}` + " ms`");
	},
};