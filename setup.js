const mariadb = require('mariadb')
const { sqlconfig } = require('./config.json')

main()
async function main() {
    const con = await mariadb.createConnection(sqlconfig)
    const playerprefsResponse = await con.query(
        "CREATE TABLE IF NOT EXISTS `playerpreferences` (\n" +
        "`discordid` BIGINT(20) NOT NULL,\n" +
        "`shortmode` BOOLEAN NOT NULL DEFAULT '0',\n" +
        "PRIMARY KEY (`discordid`)\n" +
        ");"
    )
    console.log(playerprefsResponse)
    const playersResponse = await con.query(
        "CREATE TABLE IF NOT EXISTS `players` (\n" +
        "`discordid` BIGINT(20) NOT NULL,\n" + 
        "`osuname` TEXT NOT NULL,\n" +
        "PRIMARY KEY (`discordid`)\n" +
        ");"
    )
    console.log(playersResponse)
    con.end()
}