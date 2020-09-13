const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt')

let userSchema = new Schema({
    email: String,
    pw: String,
    soundPath: { 'type': String, 'default': './' }
});

userSchema.statics.encryptPassword = async (pw) => {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(pw, salt)
}

userSchema.statics.comparePassword = async (pw, hash) => {
    return await bcrypt.compare(pw, hash)
}

module.exports = mongoose.model('user', userSchema)