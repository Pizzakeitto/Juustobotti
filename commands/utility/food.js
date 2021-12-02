const Discord = require('discord.js')

module.exports = {
    name: 'food',
    description: 'get todays and tomorrows food!',
    async execute(message = new Discord.Message, args = [""]) {
        const axios = require('axios').default

        const url = "https://fi.jamix.cloud/apps/menuservice/rest/haku/menu/97325/7?lang=fi" // food api for signe
        const response = await axios(url)
        const data = response.data[0]

        const menus = data.menuTypes[0].menus[0]
        let now = new Date()

        let today = now.toISOString().split("-")
        today.push( today.pop().split("T").shift() )
        today = today.join("") // returns 20211202 as of writing this code

        let tomorrow = new Date(now)
        tomorrow.setDate(tomorrow.getDate() + 1)
        tomorrow = tomorrow.toISOString().split("-")
        tomorrow.push( tomorrow.pop().split("T").shift() )
        tomorrow = tomorrow.join("") // returns 20211203 as of writing this code

        // console.log(`today is ${today} and tomorrow is ${tomorrow}`) // "today is 20211202 and tomorrow is 20211203"

        let todaysFood
        let tomorrowsFood
        for (const day of menus.days) {
            if(day.date == today){
                console.log("found todays food!")
                todaysFood = day
            }
            if(day.date == tomorrow) {
                console.log("Found tomorrows food!")
                tomorrowsFood = day
            }
        }

        if (todaysFood == undefined) return message.channel.send("Couldn't find todays food for some reason!")
        if (tomorrowsFood == undefined) return message.channel.send("Couldn't find tomorrows food!")

        // console.log(todaysFood)
        // console.log(tomorrowsFood)

        let todaysOptions = []
        todaysFood.mealoptions.map(foodThing => {
            let option = `**${foodThing.name.replace(/[\.*]/g, "")}:** ${foodThing.menuItems.map(menuItem => `${menuItem.name.replace(/[\.*]/g, "")}`).join(", ")}`
            todaysOptions.push(option)
        })
        let tomorrowsOptions = []
        tomorrowsFood.mealoptions.map(foodThing => {
            let option = `**${foodThing.name.replace(/[\.*]/g, "")}:** ${foodThing.menuItems.map(menuItem => `${menuItem.name.replace(/[\.*]/g, "")}`).join(", ")}`
            tomorrowsOptions.push(option)
        })

        const foodEmbed = new Discord.MessageEmbed
        foodEmbed.setTitle("Ruoka")
        foodEmbed.setDescription("Signessä!!!")
        foodEmbed.setColor(0x007000)

        foodEmbed.addField("Todays food:", todaysOptions.join("\n"))
        foodEmbed.addField("Tomorrows food:", tomorrowsOptions.join("\n")) // !!! make this be the next possible food day instead!!!

        message.channel.send(foodEmbed)
    }
}