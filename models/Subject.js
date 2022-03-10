const { model, Schema } = require('mongoose')

const Subject = new Schema({
    name: {type: String, required: true, unique: true},
    link: {type: String},
    hometask: {type: String},
})

module.exports = model('Subject', Subject);