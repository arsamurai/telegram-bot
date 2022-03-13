const { model, Schema } = require('mongoose')

const Subject = new Schema({
    name: {type: String, required: true, unique: true},
    link: {type: String},
    hometask: {type: String},
    numOfLesson: {type: String},
    numOfDay: {type: String},
})

module.exports = model('Subject', Subject);