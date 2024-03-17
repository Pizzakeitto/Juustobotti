const Discord = require('discord.js')
const { utcToZonedTime } = require('date-fns-tz')

module.exports = {
	name: 'clock',
    aliases: ['time'],
	description: 'gets the current time!!',
    detailedDescription: 'Do not take this seriously.',
	execute(message = new Discord.Message.prototype, args = []) {
        const now = utcToZonedTime(new Date(), "Europe/Helsinki") // +2 hours since server is utc
        const minutes = now.getMinutes()
        let time = minutes < 10 ? `11:0${minutes}` : `11:${minutes}`
        const suffix = now.getHours() >= 12 ? "pm" : "am"
        const embed = new Discord.EmbedBuilder()
            .setAuthor({name: 'Current time', iconURL: 'https://cdn.discordapp.com/avatars/733444772869701665/23b784ed7fe6afb8fce774cd8ec7c9a8.webp'})
            .setColor(0x0099FF)
            .setDescription(`The current time is ${time} ${suffix}`)
            .setFooter({text: "😱"})
        message.channel.send({embeds: [embed]})
    }
}
