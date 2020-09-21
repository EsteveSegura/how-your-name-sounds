const user = require('../models/user')

async function editUserDataBase(email, dataUpdate) {
    if (dataUpdate.hasOwnProperty('pw')) dataUpdate.pw = await user.encryptPassword(dataUpdate.pw)
    let doc = await user.findOneAndUpdate({ email: email }, { $set: dataUpdate }, { upsert: true, new: true })
    return doc
}

async function getUserDataBase(data, filter) {
    let findUserAlreadyExists = await user.findOne({ email: data.email }, filter != null ? filter : "" )
    return findUserAlreadyExists
}

async function getFeedDataBase() {
    let getFeed = await user.find({}, 'screenName soundPath updatedAt -_id').sort({ updatedAt: 'desc' }).limit(10)
    return getFeed
}


module.exports = { editUserDataBase, getUserDataBase, getFeedDataBase }