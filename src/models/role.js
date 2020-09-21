const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let roleSchema = new Schema({
    //commonuser,admin, reporter
    name: String,
    permissions: [{
        permissionLevel: Number,
        actions : [String]
    }],
})

module.exports = mongoose.model('role', roleSchema)