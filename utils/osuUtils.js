exports.wysi = (a) => wysi(a)
exports.getosuUser = (id, returnId = false) => getosuUser(id, returnId)
exports.shortenMods = (mods) => shortenMods(mods)
exports.rankToEmoji = (rank) => rankToEmoji(rank)

function wysi(toparse = ''){
    try {
        return toparse.toString().replace(/(727)|(72,7)|(7,27)|(7\.27)|(72\.7)|(72 7)|(7 27)|(72\/7)|(7\/27)/g, str => {
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
                case '72/7':
                    return '**__72/7__**'
                case '7/27':
                    return '**__7/27__**'
                default:
                    return str
            }
        })
    } catch (err) {
        console.log('couldnt see it :(')
        return toparse
    }
}

/**
 * Get someones username from the database, according to their Discord ID.
 * Gotta change this to also return the id of the user because api v2 logics.
 * @async
 * @param {number} id Discord ID
 * @returns {Promise<string> | Promise<object>} Username (and id)
 * 
 * I should do some overflowing magic but idk how lol
 */
async function getosuUser(id, returnId = false) {
    const mariadb = require('mariadb')
    const { sqlconfig } = require('../config.json')
    const con = await mariadb.createConnection(sqlconfig)
    const response = await con.query("SELECT osuname, osuid FROM players WHERE discordid = " + id)
    con.end()

    if (returnId) {
        return {
            name: response[0].osuname,
            id: response[0].osuid
        }
    } else return response[0].osuname
}

async function getosuPreferences(id) {
    const mariadb = require('mariadb')
    const { sqlconfig } = require('../config.json')
    const con = await mariadb.createConnection(sqlconfig)
    const response = await con.query("SELECT osuname FROM playerpreferences WHERE discordid = " + id)
    con.end()
    return response[0].osuname
}

/**
 * Thanks previous me for writing this already :yoink:
 * @param {string[]} mods 
 * @returns {string[]} mods, but shorter
 */
function shortenMods(mods = [""]) {
    let parsedMods = ''
    mods.forEach(mod => {
        switch (mod) {
            case 'None':
                parsedMods += 'Nomod'
                break
            case 'NoFail':
                parsedMods += 'NF'
                break
            case 'Easy':
                parsedMods += 'EZ'
                break
            case 'TouchDevice':
                parsedMods += 'TD'
                break
            case 'Hidden':
                parsedMods += 'HD'
                break
            case 'HardRock':
                parsedMods += 'HR'
                break
            case 'SuddenDeath':
                parsedMods += 'SD'
                break
            case 'DoubleTime':
                parsedMods += 'DT'
                break
            case 'Relax':
                parsedMods += 'RX'
                break
            case 'HalfTime':
                parsedMods += 'HT'
                break
            case 'Nightcore':
                parsedMods += 'NC'
                break
            case 'Flashlight':
                parsedMods += 'FL'
                break
            case 'Autoplay':
                parsedMods += 'Autoplay?'
                break
            case 'SpunOut':
                parsedMods += 'SO'
                break
            case 'Relax2':
                parsedMods += 'AP'
                break
            case 'Perfect':
                parsedMods += 'PF'
                break
            case 'ScoreV2':
                parsedMods += 'SV2'
                break
            default:
                break
        }

    })

    if(parsedMods != '') return parsedMods
    else return 'Nomod'
}

/**
 * Convert rank to emoji for ease and fancyness
 * @param {string} rank 
 * @returns {string} emoji
 */
function rankToEmoji(rank = "") {
    switch (rank) {
        case 'A':
            return '<:A_:881163307350892605>'
        case 'B':
            return '<:B_:881163307564798023>'
        case 'C':
            return '<:C_:881163307648688129>'
        case 'D':
            return '<:D_:881163307250249739>'
        case 'S':
            return '<:S_:881163307229282385>'
        case 'SH':
            return '<:SH:881163307233456159>'
        case 'X':
            return '<:X_:881163307623518268>'
        case 'XH':
            return '<:XH:881163307636117524>'
        case 'F':
            return '<:F_:881163307585765416>'
        default:
            return rank
    }
}