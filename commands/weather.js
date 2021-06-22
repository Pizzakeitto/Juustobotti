const Discord = require('discord.js')
module.exports = {
    name: 'weather',
    description: 'Antaa säätiedot määrittämästä paikasta',
    execute(message = new Discord.Message, args = []){
        // Toteutetaas tää käyttäen openweathermap.org
        // https://openweathermap.org/current
        const fetch = require('node-fetch')
        const isoCountries = require('../isoCountries.json') // Thanks maephisto! https://gist.github.com/maephisto/9228207

        if(args.length == 0) return message.channel.send('Anna joku paikka lol, vähintää kaupungin nimi.') // voi myös lisätä 

        let apiKey = process.env.OPENWEATHERKEY
        let endpoint = 'https://api.openweathermap.org/data/2.5/weather?q='
        let iconendpoint = 'https://openweathermap.org/img/wn/' // https://openweathermap.org/weather-conditions
        
        let fetchUrl = `${endpoint}${args[0]}&units=metric&appid=${apiKey}`
        console.log(fetchUrl)
        fetch(fetchUrl).then(res => res.json()).then(data => {
            console.log(data)
            let weatherMap = new Map()
            weatherMap.set("location", getCountryName(data.sys.country))
            weatherMap.set("city", data.name)
            weatherMap.set("weather", data.weather[0].main)
            weatherMap.set("desc", data.weather[0].description)
            weatherMap.set("temp", data.main.temp) 
            weatherMap.set("feelslike", data.main.feels_like)
            weatherMap.set("windspeed", data.wind.speed) // metri per sekuntti
            weatherMap.set("clouds", data.clouds.all) // pilvisyyden määrä %

            let fields = [
                { name: 'Temperature', value: `${weatherMap.get('temp')}°C` },
                { name: 'Feels like', value:  `${weatherMap.get('feelslike')}°C` },
                { name: 'Wind speed', value: `${weatherMap.get('windspeed')} m/s` },
                // { name: '', value: `${weatherMap.}` },
                // { name: 'Temperature', value: `${weatherMap.}` },
                // { name: 'Temperature', value: `${weatherMap.}` },
                // { name: 'Temperature', value: `${weatherMap.}` },
                // { name: 'Temperature', value: `${weatherMap.}` },
            ]

            console

            // ° asteen merkki
            let weatherEmbed = new Discord.MessageEmbed()
                .setAuthor(`Weather in ${weatherMap.get('city')}, ${weatherMap.get('location')}`, `https://www.countryflags.io/${data.sys.country}/shiny/32.png`)
                .setDescription(`It is ${weatherMap.get('weather')} yes yes (${weatherMap.get('desc')})`)
                .setColor('#00f9f9')
                .setThumbnail(`${iconendpoint}${data.weather[0].icon}@2x.png`)
                .addFields(fields)
                .setFooter('Data from https://openweathermap.org/current')
                .setTimestamp(Date(data.dt))

            message.channel.send(weatherEmbed)
        })

        function getCountryName(countryCode) {
            if (isoCountries.hasOwnProperty(countryCode)) {
                return isoCountries[countryCode];
            } else {
                return countryCode;
            }
        }
    }
}