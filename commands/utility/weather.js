const Discord = require('discord.js')
module.exports = {
    name: 'weather',
    description: 'Get the weather of some place',
    detailedDescription: 'You wna know the weather? Now you can without looking outside!',
    usage: `weather [some place]`,
    execute(message = Discord.Message.prototype, args = []){
        // Toteutetaas tää käyttäen openweathermap.org
        // https://openweathermap.org/current
        const axios = require('axios').default
        
        const isoCountries = require('../../isoCountries.json') // Thanks maephisto! https://gist.github.com/maephisto/9228207

        if(args.length == 0) return message.channel.send('Please specify what do you wanna know the weather of?') // voi myös lisätä 

        const apiKey = process.env.OPENWEATHERKEY
        const endpoint = 'https://api.openweathermap.org/data/2.5/weather'
        const geocodingEndpoint = 'https://api.openweathermap.org/geo/1.0/direct'
        const iconendpoint = 'https://openweathermap.org/img/wn/' // https://openweathermap.org/weather-conditions
        
        // Esimerkki input ['lahti', 'fi']
        // Pyörii jokasella argumentilla listas
        for(i = 0; i < args.length; i++) {
            if(args[0] && !args[1]) break
            // Jos isoCountries listassa löytyy argumentti isoina kirjaimina (esim 'fi' isona löytyy listast)
            if( isoCountries.hasOwnProperty(args[i].toUpperCase()) ) {
                // Vaihtaa sen argumentin olemaa isoina kirjaimina (fi -> FI)
                args[args.indexOf(args[i])] = args[i].toUpperCase()
            } else if( isoCountries.hasOwnProperty(capitalize(args[i])) ) {
                // Jos ei, nii jos löytyy oikein isoina kirjaimina maa listasta (esim 'finland' löytyy listast 'Finland')
                // ni joo
                args[args.indexOf(args[i])] = capitalize(args[i])
                args[args.indexOf(args[i])] = getCountryCode(args[i])
            }
        }

        // Jos joku inputtaa esim ju!weather fi lahti, tää kääntää ympäri.
        // Parempi ois kattoo onks listas, ja sitte reverse,, jos ettii jotai kakskirjaimisii kaupunkei etc
        if(args[0].length == 2 && isoCountries.hasOwnProperty(args[0])) args.reverse()

        // Async time yay
        // I should switch to Deno or Bun or something for top level async
        doTheThingsThatNeedToBeDoneInAGoodWay()
        async function doTheThingsThatNeedToBeDoneInAGoodWay() {
            // Get latitude and longitude
            const locationParams = {
                q: args.join(),
                limit: 1,
                appid: apiKey
            }
            const locationReq = await axios.get(geocodingEndpoint, {params: locationParams})
                .catch(err => {console.log(err); message.channel.send("Sorry, something broke!@pizzakeitto")})
            const location = locationReq.data[0]
            if(!location) return message.channel.send("Couldn't find this place!")
            //console.log(location)

            // Get weather data from latitude and longitude
            // TODO: move this to a function
            const weatherParams = {
                lat: location.lat,
                lon: location.lon,
                units: "metric",
                appid: apiKey
            }
            const weatherReq = await axios.get(endpoint, {params: weatherParams})
                .catch(err => {console.log(err); message.channel.send("Sorry, something broke!@pizzakeitto")})

            const weatherData = weatherReq.data

            const forecast = await getForecast(apiKey, location.lat, location.lon)
            console.log(forecast)

            const country = getCountryName(weatherData.sys.country)
            const id = weatherData.id
            const city = weatherData.name
            const weather = weatherData.weather[0].main
            const weatherDesc = weatherData.weather[0].description
            const temperature = weatherData.main.temp
            const feelsLike = weatherData.main.feels_like
            const humidity = weatherData.main.humidity
            const windSpeed = weatherData.wind.speed
            const windArrow = degToArrow(weatherData.wind.deg)

            const forecast1 = forecast.list[0] // at most +3 hours
            const forecast2 = forecast.list[1] // at most +6 hours
            const forecast3 = forecast.list[2] // at most +9 hours


            // ° asteen merkki
            let fields = [
                { name: 'Temperature', value:  `${temperature}°C`, inline: true },
                { name: 'Wind', value: `${windSpeed} m/s \\${windArrow}`, inline: true },
                { name: 'Humidity', value: `${humidity}%`, inline: true },
                { name: `At <t:${forecast1.dt}:t>`, value: `${forecast1.weather[0].main}, ${forecast1.weather[0].description}\n${forecast1.main.temp}°C`, inline: true },
                { name: `At <t:${forecast2.dt}:t>`, value: `${forecast2.weather[0].main}, ${forecast2.weather[0].description}\n${forecast2.main.temp}°C`, inline: true },
                { name: `At <t:${forecast3.dt}:t>`, value: `${forecast3.weather[0].main}, ${forecast3.weather[0].description}\n${forecast3.main.temp}°C`, inline: true },
            ]

            let weatherEmbed = new Discord.MessageEmbed()
                .setAuthor(`Weather in ${city}, ${country}`, `https://pizzakeitto.xyz/flags/flags-iso/shiny/32/${weatherData.sys.country}.png`, `https://openweathermap.org/city/${id}`)
                .setDescription(`It is ${weather} yes yes (${weatherDesc})`)
                .setColor('#00f9f9')
                .setThumbnail(`${iconendpoint}${weatherData.weather[0].icon}@2x.png`)
                .addFields(fields)
                .setFooter({text: 'Data from https://openweathermap.org/current'})
                .setTimestamp(Date(weatherData.dt))

            message.channel.send({embeds: [weatherEmbed]})
            
        }

        function getCountryName(countryCode) {
            if (isoCountries.hasOwnProperty(countryCode)) {
                return isoCountries[countryCode]
            } else {
                return countryCode
            }
        }

        // Basically turha, sama asia ku getCountryName()
        function getCountryCode(countryName) {
            if (isoCountries.hasOwnProperty(countryName)) {
                return isoCountries[countryName]
            } else {
                return countryName
            }
        }

        // Kopioitu suoraa netist, https://www.digitalocean.com/community/tutorials/js-capitalizing-strings
        function capitalize(string = "") {
            return string.trim().toLowerCase().replace(/\w\S*/g, (w) => (w.replace(/^\w/, (c) => c.toUpperCase())))
        }

        // Converts wind direction to arrow emojis
        function degToArrow(deg = 0) {
            const emojis = [
                '⬆',
                '↗',
                '➡',
                '↘',
                '⬇',
                '↙',
                '⬅',
                '↖',
                '⬆'
            ]
            return emojis[Math.round(deg/45)]
        }

        async function getForecast(apiKey, lat, lon) {
            const endpoint = "https://api.openweathermap.org/data/2.5/forecast"
            const response = await axios.get(endpoint, {params: {
                lat: lat,
                lon: lon,
                units: "metric",
                appid: apiKey    
            }}).catch(err => {
                console.log(err)
            })
            return response.data
        }
    }
}
