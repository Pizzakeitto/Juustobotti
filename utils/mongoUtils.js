
const { ApplicationCommandOptionWithChoicesAndAutocompleteMixin } = require('discord.js')
const mongoose = require('mongoose')
const { Schema } = require('mongoose')

// Make schemas
const userSchema = new Schema({
    _id:        Number,
    wallet:     Number,
    inventory:  Array(String),

})

const bankSchema = new Schema({
    _id:        Number,
    users:  [
        { id: Number, balance: Number }
    ],
})

const User = mongoose.model("User", userSchema)
const Bank = mongoose.model("Bank", bankSchema)

exports.User = User
exports.addMoney = addMoney
exports.getUser  = getUser

async function addMoney(id, amount) {
    const user = await User.findOne({_id: id}) || new User({
        _id: id,
        wallet: 100
    })
    user.wallet += amount
    user.save()
}

async function getUser(id) {
    const user = await User.findOne({_id: id}) || new User({
        _id: id,
        wallet: 100
    })
    // Get the current bank, if it doesnt exist for some reason create a new one
    // This should only happen once (so never)
    const bank = await Bank.findOne({_id: 0}) || new Bank({
        
    })
    return user
}