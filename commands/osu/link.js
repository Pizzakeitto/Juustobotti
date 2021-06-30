module.exports = {
    name: 'link',
    description: 'Links your discord name with your osu! name',
    execute(message, args){
        if(args[0] == null || undefined){
            return message.channel.send("No arguments given!")
        }

        const mysql = require('mysql')
        const {sqlconnection} = require('../../config.json')

        let con = mysql.createConnection(sqlconnection);
        con.connect((err) => {
            if (err) return console.error(err);
            // console.log('Connected to MySQL')

            con.query(`INSERT INTO players (discordid, osuname) VALUES ('${message.author.id}', '${args[0]}') ON DUPLICATE KEY UPDATE osuname='${args[0]}'`, (err, res, fields) => {
                if(err) return console.error(err);

                if(res.affectedRows == "1") {
                    message.channel.send("Yup, you're linked aight. Now do `ju!osu`, I dare you")
                    console.log(message.author.tag + " got saved to the database")
                }
            })
        })

        // rip
        // MongoClient.connect(dburl, {useUnifiedTopology: true}, function(err, client) {
        //     //assert.strictEqual(null, err);
        //     if(err != null){
        //         return console.error(err);
        //     }
        //     console.log("Connected to mongo server");
        // 
        //     let userData = new Map();
        //     userData.set("_id", message.author.id); //Discord user's id is being used
        //     userData.set("osuname", args[0]);
        // 
        //     let alreadyLinked = false;
        //     const db = client.db(dbname);
        //     
        //     db.collection("userLinks").insertOne(userData, function(err, res){
        //         if(err) {
        //             console.error(err);
        //             message.channel.send('Some error ocurred (Already linked?)')
        //             client.close();
        //             return;
        //         }
        //         message.channel.send('You was linked aight');
        //         client.close();
        //     })
        // })
    }
}