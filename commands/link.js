module.exports = {
    name: 'link',
    description: 'Links your discord name with your osu! name',
    execute(message, args){
        if(!args){
            return message.channel.send("No arguments given!")
        }
        const prefix = process.env.PREFIX;
        const assert = require('assert')
        const MongoClient = require('mongodb').MongoClient;
        const dbname = 'juustobotData';
        const dburl = process.env.DBURL + dbname;

        MongoClient.connect(dburl, {useUnifiedTopology: true}, function(err, client) {
            //assert.strictEqual(null, err);
            if(err != null){
                return console.error(err);
            }
            console.log("Connected to mongo server");

            let userData = new Map();
            userData.set("_id", message.author.id);
            userData.set("osuname", args[0]);

            let alreadyLinked = false;
            const db = client.db(dbname);
            
            db.collection("userLinks").insertOne(userData, function(err, res){
                if(err) {
                    console.error(err);
                    message.channel.send('Some error ocurred (Already linked?)')
                    client.close();
                    return;
                }
                //console.log("Userdata saved: " + res);
                message.channel.send('You was linked aight');
                client.close();
            })
        })
    }
}