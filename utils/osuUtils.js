exports.wysi = (a) => wysi(a)
exports.getosuUsername = (a) => getosuUsername(a)

function wysi(toparse = ''){
    try {
        return toparse.toString().replace(/(727)|(72,7)|(7,27)|(7\.27)|(72\.7)|(72 7)|(7 27)/g, str => {
            switch(str){
                case '727':
                    return '**__727__**'
                case '72,7':
                    return '**__72,7__**'
                case '7,27':
                    return '**__7,27__**'
                case '7.27':
                    return '**__7.27__**'
                case '72.7':
                    return '**__72.7__**'
                case '72 7':
                    return '**__72 7__**'
                case '7 27':
                    return '**__7 27__**'
            }
        })
    } catch (err) {
        console.log('couldnt see it :(')
        return toparse
    }
}

/**
 * Get someones username from the database, according to their Discord ID.
 * @async
 * @param {number} id Discord ID
 * @returns {string} Username
 */
async function getosuUsername(id) {
    const mariadb = require('mariadb')
    const { sqlconfig } = require('../config.json')
    const con = await mariadb.createConnection(sqlconfig)
    const response = await con.query("SELECT osuname FROM players WHERE discordid = " + id)
    con.end()
    return response[0].osuname
}

async function getosuPreferences(id) {
    const mariadb = require('mariadb')
    const { sqlconfig } = require('../config.json')
    const con = await mariadb.createConnection(sqlconfig)
    const response = await con.query("SELECT osuname FROM playerpreferences WHERE discordid = " + id)
    con.end()
    return response[0].osuname
}