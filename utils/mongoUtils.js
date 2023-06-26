
const { ApplicationCommandOptionWithChoicesAndAutocompleteMixin } = require('discord.js')
const mongoose = require('mongoose')
const { Schema } = require('mongoose')

// Make schemas
const userSchema = new Schema({
    _id:        Number,
    wallet:     Number,
    bank:       Number,
    inventory:  Array(String),
    stats:      {
        gamesWon:   Number,
        gamesLost: Number,
        profit: Number,
        losses: Number
    }
})

const bankSchema = new Schema({
    _id:        Number,
    users:  [
        { id: Number, balance: Number }
    ],
})

const serverConfigSchema = new Schema({
    _id:        Number, //Server id
    prefix:     String
})

const ServerConfig = mongoose.model("ServerConfig", serverConfigSchema)

const User = mongoose.model("User", userSchema)

exports.User = User
exports.getUser  = getUser
exports.ServerConfig = ServerConfig

async function getUser(id) {
    const user = await User.findOne({_id: id}) || new User({
        _id: id,
        wallet: 0,
        bank: 100,
        inventory: [],
        stats: {
            gamesWon: 0,
            gamesLost: 0,
            profit: 0,
            losses: 0
        }
    })

    return user
}