const { prefix } = require('../../config.json')
const Discord = require('discord.js')

module.exports = {
	name: 'help',
	description: 'List all of my commands or info about a specific command.',
	usage: '[command name]',
	execute(message = new Discord.Message, args = []) {
		const data = [];
        const {commands} = message.client;
        if (!args.length) {
            data.push('Here\'s a list of me commands:');
            data.push(commands.map(command => command.hidden ? '' : command.name).filter(n => n).join(', '))
            data.push(`\n(You can send '${prefix}help [command] to get more info about a specific command!)`);
            message.channel.send(data)
        }
	}
}