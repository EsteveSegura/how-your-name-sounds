//const mail = require('../libs/mail');
const user = require('../models/user');
const dbUser = require('../db/user.db');
const validation = require('../middleware/validation');
const uploadFile = require('../middleware/uploadFile');

const audioCensor = "https://www.myinstants.com/media/sounds/ringtone_20.mp3"

async function getUsers(req, res) {
    let getFeed = await dbUser.getFeedDataBase(0)
    if (!getFeed) return res.status(404).json({ 'error': 'feed could not be found' })

    return res.status(200).json(getFeed)
}

async function censorUser(req, res) {
    let censor = await dbUser.editUserDataBase(req.params.email, { soundPath: audioCensor })
    if (!censor) return res.status(500).json({ 'error': 'cant edit this user' })

    return res.status(200).json(censor)
}

module.exports = { getUsers, censorUser }