// Päivän annos juttu
// Ravitsemussuositusket alla löytyvästä paikasta olevassa pdf_Ssä juttutuqiu hiwueyfwuyerskfhebrsgvh
// https://www.ruokavirasto.fi/teemat/terveytta-edistava-ruokavalio/ravitsemus--ja-ruokasuositukset/
// 
// Tieto ruuista tulee https://fineli.fi/fineli/fi/avoin-data

const Discord = require('discord.js')
const parser = require('@fast-csv/parse')
const fs = require('fs')

module.exports = {
    name: 'annos',
    description: 'Päivän annos, tieteellisesti',
    execute(message = Discord.Message.prototype, args = [""]) {
        // ravitsemussuositukset isona listana, 18-30v miehet
        // yksiköt vaihtelevat koska näin tekevät myös datassa???????
        const ravitsemussuositukset = [
            // Vitamiinit
            { VITA: 900 }, // A vitamiini
            { VITD: 10  }, // D Vitamiini
            { VITE: 10  }, // E vitamiini
            { THIA: 1.4 }, // Tiamiini, B1 vitamiini 
            { RIBF: 1.6 }, // Riboflaviini, B2 vitamiini
            { NIA:  19  }, // Niasiini (nikotiinihappo + nikotiiniamidi), B3 vitamiini
            { VITPYRID: 1.5}, // pyridoksiini vitameerit (vetykloridi), B6 vitamiini
            { FOL:  300 }, // Folaatti, B9 vitamiini
            { VITB12: 2 }, // B12 vitamiini
            { VITC: 75  }, // C vitamiini

            // Kivennäisaineet
            { CA: 800 }, // Kalsium
            { P:  600 }, // Fosfori
            { K:  3.5 }, // Kalium
            { MG: 350 }, // Magnesium
            { FE: 9   }, // Rauta
            { ZN: 9   }, // Sinkki
            { CU: 0.9 }, // Kupari
            { ID: 150 }, // Jodi
            { SE: 60  }, // Seleeni

            // Misc
            {}
        ]
        
        getRandomFood().then(food => {
            food.FOODNAME = capitalize(food.FOODNAME)
            console.log(food)
            const foodid = food.FOODID
            const componentValue = JSON.parse(fs.readFileSync('./commands/fun/finelidata/cleaned_component_value.json').toString())
            let components = componentValue.filter(val => {
                return val.FOODID == foodid
            })
            components = components[0]
            delete components.FOODID
            console.log(components)
        })

        /**
         * This function shouldn't be used every time the command is ran, as it takes a few seconds.
         * It exists to clean the component_value data into something more readable.
         * _seriously, fuck csv_
         */
        function cleanData() {
            parseFile('./commands/fun/finelidata/component_value.csv').then(parsed => {
                // fs.writeFileSync('./component_value.json', JSON.stringify(parsed, null, 2))
                let cleaned = []
                let clean = {}
                let previd = 1
                parsed.map((value) => {
                    // if the id were going thru rn is the same as previously, add a new thing to the clean data
                    if(previd == Number(value.FOODID)) {
                        let stuff = {
                            FOODID: value.FOODID, // dont forget the food id
    
                            [value.EUFDNAME]: Number(value.BESTLOC.replace(",", ".")),
                        }
                        Object.assign(clean, stuff)
                    } 
                    // dump the clean data to the array
                    else {
                        cleaned.push(clean)
                        clean = {} // and reset clean data
                        previd = value.FOODID // and change the id to  the next one
                    }
                })
                fs.writeFileSync('cleaned_component_value.json', JSON.stringify(cleaned, null, 2))
            })
        }


        /**
         * Returns a random food object
         * @returns {Promise<object>}
         */
        async function getRandomFood() {
            const parsed = await parseFile('./commands/fun/finelidata/food.csv')
            return parsed[randomNumber(parsed.length)]
        }

        /**
         * Takes a CSV file as input and returns a list of objects.
         * @param {string} filePath
         * @returns {Promise<[]>}
         */
        async function parseFile(filePath) {
            return new Promise((resolve, reject) => {
                let data = []
                parser.parseFile(filePath, {
                    delimiter: ';',
                    headers: true
                })                
                .on('error', err => {
                    console.log(err)
                    reject(err)
                })
                .on('data', chunk => data.push(chunk))
                .on('end', rowCount => {
                    console.log(`Parsed ${rowCount} rows`)
                    resolve(data)
                })
            })
        }

        function randomNumber(max = 0){
            return Math.floor(Math.random() * max)
        }

        // Kopioitu suoraa netist, https://www.digitalocean.com/community/tutorials/js-capitalizing-strings
        function capitalize(string = "") {
            return string.trim().toLowerCase().replace(/\w\S*/g, (w) => (w.replace(/^\w/, (c) => c.toUpperCase())))
        }

        // console.log(`${typeof food} is food\nand foods value is ${JSON.stringify(food, null, 2)}`)

        // Päivän annoksen (ainetta) saat syömällä (määrä)(yksikkö) (ruokaa).
        // esim.
        // Päivän annoksen suolaa saat syömällä 39,4kg Papu, adukipapu, kuivattu.
    }
}