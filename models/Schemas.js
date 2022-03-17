const { model, Schema } = require('mongoose')

const subjectSchema = new Schema({
    name: {type: String, required: true, unique: true},
    link: {type: String},
    hometask: {type: String},
    numOfLesson: {type: String},
    numOfDay: {type: String},
})

const userSchema = new Schema({
	id: {type: Number, required: true, unique: true},
	first_name: {type: String},
	last_name: {type: String},
	username: {type: String},
})

const Subject = model('Subject', subjectSchema);
const User = model('User', userSchema);

module.exports = {Subject, User}