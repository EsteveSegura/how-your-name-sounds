const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let userSchema = new Schema({
    email: String,
    pw: String,
    soundPath: {'type': String, 'default':'./'}
});

module.exports = mongoose.model('user', userSchema)