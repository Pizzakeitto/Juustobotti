# Juustobotti
## NOTE!! This readme is very much WIP and I'm too lazy to write it properly atm, message me if you wna know more!
It is a bot for discord that gets data from the osu api and shoves them somewhere. Basically am trying to learn :)

Dependencies:
* dotenv
* mysql
* discord.js
* node-osu (will be replaced with osu-api-extended soon ish)
* A lot more
* god im lazy
* check package.json :)

You'll need your own MySQL database. I'm working on a script to automate making the database. If you're feeling brave, you can try it right now by doing `node setup.js` (after doing `npm install`)

If you want to try this out yourself for some reason, create your own .env file with these defined (Yeah theres alot lol):
```
BOTTOKEN=
OSUTOKEN=
OPENWEATHERKEY=
DOGAPIKEY=
YTAPIKEY=
WOLFRAMID=
OPENAIKEY=
OSUCLIENTID=
OSUCLIENTSECRET=
```
DM me if you need help with what keys you need.
After that do `npm install` and `node bot.js` and the bot *should in theory* become online

Btw this readme is very much wip so yeah ask me for more info if youre really interested

TODO: 

- [x] Get the bot working with another database mongo bad
- [x] I guess make the linking of a profile work correctly
- [x] More fancy help command
- [ ] Translate the bot to full english/finnish havent decided yet
- [ ] This readme
- [ ] Rewrite osu related commands to use api v2
  - [x] ju!osu
  - [ ] ju!rs
  - [ ] ju!link
  - [ ] ju!mostplayed
