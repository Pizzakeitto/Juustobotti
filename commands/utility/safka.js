const Discord = require('discord.js')

const parseDayId = (id) => {
    return ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"][id]
}

const parseDate = (dateStr) => {
    date = new Date(dateStr)
    return `${date.getDate()}.${date.getMonth()+1}`
}

module.exports = {
    name: 'safka',
    description: 'get todays food in safka school restaurants!',
    async execute(message = Discord.Message.prototype, args = [""]) {
        const axios = require('axios').default

        let today = await axios.get("https://api.safka.online/v2/menu/today")
            .then(response => response.data) // Directly return 'data' from the axios response
            .catch(err => {
                message.channel.send("Couldn't reach the food (Safka is down <:hollow:1028705732180328550>)");
                console.log(err)
                return undefined;
            });
      
        if (today == undefined) return;

        const tomorrowId = today.dayId < 6 ? today.dayId+1 : 0
        const tomorrow = (await axios.get(`https://api.safka.online/v2/menu/${tomorrowId}`)).data

        const foodEmbed = new Discord.EmbedBuilder()
            .setTitle("Ruoka")
            .setDescription("Safkassa!!!!")
            .setFooter({ text: "Näe kaikki päivät ja koe uskomaton ruokalista elämys osoitteessa https://safka.online" })
            .setColor("#fa3a3a")

        if (!today.menu.length && !tomorrow.menu.length) 
            foodEmbed.addFields({name: "There is no food.", value: "Stay home."})

        if (today.menu.length) 
            foodEmbed.addFields({name: `Todays food (${parseDayId(today.dayId)} ${parseDate(today.date)}):`, value: today.menu.map(meal => meal.names).join("\n")})
        if (tomorrow.menu.length) 
            foodEmbed.addFields({name: `Tomorrows food (${parseDayId(tomorrow.dayId)} ${parseDate(tomorrow.date)}):`, value: tomorrow.menu.map(meal => meal.names).join("\n")})

        message.channel.send({embeds: [foodEmbed]}).catch(err => {
            console.log(err)
            message.channel.send("no food")
        })
    }
}
