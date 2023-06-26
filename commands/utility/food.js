const Discord = require('discord.js')

module.exports = {
    name: 'food',
    description: 'get todays food!',
    async execute(message = Discord.Message.prototype, args = [""]) {
        const axios = require('axios').default

        const url = "https://fi.jamix.cloud/apps/menuservice/rest/haku/menu/97325/7?lang=fi" // food api for signe
        const response = await axios(url)
        const data = response.data[0]

        if(!data) return message.channel.send("No food in ravintola signe:tm:!")

        const menus = data.menuTypes[0].menus[0]
        let now = new Date()

        let today = new Date(now.toLocaleString('en-US', { timeZone: "Europe/Helsinki" }))
        today = today.toISOString().split("-")
        today.push( today.pop().split("T").shift() )
        today = today.join("") // returns 20220214 as of writing this code

        let tomorrow = new Date(now.toLocaleString('en-US', { timeZone: "Europe/Helsinki" }))
        tomorrow.setDate(tomorrow.getDate() + 1)
        tomorrow = tomorrow.toISOString().split("-")
        tomorrow.push( tomorrow.pop().split("T").shift() )
        tomorrow = tomorrow.join("") // returns 20220215 as of writing this code

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

        let todaysOptions = []
        if(todaysFood != undefined) {
            todaysFood.mealoptions.map(foodThing => {
                let option = `**${foodThing.name.replace(/[\.*]/g, "")}:** ${foodThing.menuItems.map(menuItem => `${menuItem.name.replace(/[\.*]/g, "")}`).join(", ")}`
                todaysOptions.push(option)
            })
        }

        let tomorrowsOptions = []
        if(tomorrowsFood != undefined) {
            tomorrowsFood.mealoptions.map(foodThing => {
                let option = `**${foodThing.name.replace(/[\.*]/g, "")}:** ${foodThing.menuItems.map(menuItem => `${menuItem.name.replace(/[\.*]/g, "")}`).join(", ")}`
                tomorrowsOptions.push(option)
            })
        }

        const foodEmbed = new Discord.EmbedBuilder
        foodEmbed.setTitle("Ruoka")
        foodEmbed.setDescription("Signessä!!!")
        foodEmbed.setColor(0x007000)

        if(todaysFood != undefined) foodEmbed.addFields({name: `Todays food (${whattheday(todaysFood.weekday)}):`, value: todaysOptions.join("\n")})
        if(tomorrowsFood != undefined) foodEmbed.addFields({name: `Tomorrows food (${whattheday(tomorrowsFood.weekday)}):`, value: tomorrowsOptions.join("\n")}) // !!! make this be the next possible food day instead!!!
        if(todaysFood == undefined && tomorrowsFood == undefined) foodEmbed.addFields({name: "There is no food.", value: "Stay home."})

        message.channel.send({embeds: [foodEmbed]}).catch(err => {
            console.log(err)
            message.channel.send("no food")
        })


        function whattheday(i) {
            switch (i) {
                case 1: return "Monday"
                case 2: return "Tuesday"
                case 3: return "Wednesday"
                case 4: return "Thursday"
                case 5: return "Friday"
                case 6: return "Saturday"
                case 7: return "Sunday"
                default: return i
            }
        }
    }
}