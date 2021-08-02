module.exports = {
    name: "find",
    description: "Finds discord user by id",
    execute(message, args) {
        var bruh = async function () {
            let name;
            try{
                var bruh2 = await message.client.users.fetch(args[0]);
                if(bruh2){
                    name = bruh2.tag;
                }
            } finally {
                console.log(name + " is the bruh");
                return name;
            }
        }
        bruh().then(name => {
            message.channel.send(name + " is the maf");
        })
    }
}