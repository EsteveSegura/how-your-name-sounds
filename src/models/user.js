const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt')

let userSchema = new Schema({
    email: String,
    screenName: String,
    pw: String,
    verificationToken: String,
    verificatedUser: { 'type': Boolean, 'default': false },
    updatedAt: { 'type': Date, 'default': Date.now() },
    soundPath: { 'type': String, 'default': './' }
});

userSchema.statics.encryptPassword = async (pw) => {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(pw, salt)
}

userSchema.statics.comparePassword = async (pw, hash) => {
    return await bcrypt.compare(pw, hash)
}

userSchema.pre('findOneAndUpdate', function (next) {
    try {
        let update = this.getUpdate().$set
        if (update.soundPath) {
            this.getUpdate().updatedAt = Date.now();
        }
        next();
    } catch (error) {
        next();
    }
});

module.exports = mongoose.model('user', userSchema)