# Juustobotti
It is a bot for discord that gets data from the osu api and shoves them somewhere. Basically am trying to learn :)

Dependencies:
* dotenv
* mysql
* discord.js
* node-osu
* ojsama

You'll need your own MySQL database. I'll give you info howto setup the database later :)

If you want to try this out yourself for some reason, create your own .env file with this "template":
```
BOTTOKEN=
OSUTOKEN=
OPENWEATHERKEY=
```
And put your tokens in it. BOTTOKEN is your discord bot's token, OSUTOKEN is the token you can get from https://osu.ppy.sh/p/api and OPENWEATHERKEY is your openweathermap api key (if you want to use the weather feature of the bot).
After that do `npm i` and `node bot.js` and the bot *should in theory* become online

Btw this readme is very much wip so yeah ask me for more info if youre really interested

TODO: 

- [x] Get the bot working with another database mongo bad
- [x] I guess make the linking of a profile work correctly
- [ ] Translate the bot to full english/finnish havent decided yet
- [ ] More fancy help command
- [ ] This readme
