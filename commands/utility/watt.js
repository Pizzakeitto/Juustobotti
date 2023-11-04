const Discord = require('discord.js')
const axios = require('axios').default

module.exports = {
    name: 'watt',
    description: 'Get current electricity price in Finland',
    detailedDescription: 'Gets the current and near future electricity SPOT price in Finland.',
    aliases: ['watti', 'w'],
    async execute(message = Discord.Message.prototype, args = [""]) {
        const dateAndTimeNow = new Date(new Date().toLocaleString('en-US', {timeZone: 'Europe/Helsinki'}))
        const date = dateAndTimeNow.toISOString().split('T')[0]
        const hour = dateAndTimeNow.getHours()


        const res = await axios("https://api.porssisahko.net/v1/price.json", {
            params: {
                date: date,
                hour: hour
            }
        }).catch(err => {
            console.log(err)

        })
        const price = res.data.price
        message.channel.send(`Sähkön hinta nyt on ${price} snt / kWh`)
    }
}