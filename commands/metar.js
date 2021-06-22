const Discord = require('discord.js')
module.exports = {
    name: 'metar',
    description: 'Metar tiedot',
    execute(message = new Discord.Message, args = []){
        const fetch = require('node-fetch')
        const xmlparser = require('xml2json')

        if(args.length == 0) {
            return message.channel.send("No arguments!!!!")
        }

        async function getData(kenttä) {
            let kenttäinfo = await fetch(`https://opendata.fmi.fi/wfs?service=WFS&version=2.0.0&request=GetFeature&storedquery_id=fmi::avi::observations::iwxxm&icaocode=${kenttä}`).then(r => r.text()).then(data => data)
            kenttäinfo = kenttäinfo.replace(/:/g, '_')
            kenttäinfo = JSON.parse(xmlparser.toJson(kenttäinfo))
            return kenttäinfo
            // console.log(kenttäinfo)
        }

        getData(args[0]).then(data => {
            if(data.wfs_FeatureCollection.numberReturned == 0) return message.channel.send('Joko ei löytyny tai sit pask api lol')
            
            let apireturn = data.wfs_FeatureCollection.wfs_member[0]
            let apireturnstring = JSON.stringify(apireturn)
            let apireturnkasa = apireturnstring.match(/(["'])(?:(?=(\\?))\2.)*?\1/g)
            
            let metarCode = apireturnkasa[apireturnkasa.indexOf('"avi_input"') + 1].replace(/"/g, '')
            let nimi = apireturnkasa[apireturnkasa.indexOf('"saf_name"') + 1].replace(/"/g, '')

            let metarEmbed = new Discord.MessageEmbed()
                .setAuthor(`METAR arvo kentälle ${nimi}`)
                .setColor(`${getColor()}`)
                .setDescription(metarCode);
            
            message.channel.send(metarEmbed)
        })

        function getColor() {
            let r = Math.floor(Math.random() * 255);
            let g = Math.floor(Math.random() * 255);
            let b = Math.floor(Math.random() * 255);

            return `#${r.toString(16)}${g.toString(16)}${b.toString(16)}`
        }
    }
}