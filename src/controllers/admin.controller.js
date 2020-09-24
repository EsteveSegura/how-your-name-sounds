//const mail = require('../libs/mail');
const user = require('../models/user');
const dbUser = require('../db/user.db');
const validation = require('../middleware/validation');
const uploadFile = require('../middleware/uploadFile');

const audioCensor = "https://www.myinstants.com/media/sounds/ringtone_20.mp3"

async function getUsers(req, res) {
    let isAdminPath = req.originalUrl.startsWith('/api/admin')
    let getFeed = await dbUser.getFeedDataBase('screenName soundPath activeProfile updatedAt -_id', isAdminPath, 0)
    if (!getFeed) return res.status(404).json({ 'error': 'feed could not be found' })

    return res.status(200).json(getFeed)
}

async function censorUser(req, res) {
    let censor = await dbUser.editUserDataBase(req.params.email, { soundPath: audioCensor })
    if (!censor) return res.status(500).json({ 'error': 'cant edit this user' })

    return res.status(200).json(censor)
}

async function lockUser(req, res) {
    let lock = await dbUser.editUserDataBase(req.params.email, { activeProfile: false })
    if (!lock) return res.status(500).json({ 'error': 'cant edit this user' })

    return res.status(200).json(lock)
}

async function unlockUser(req, res) {
    let unlock = await dbUser.editUserDataBase(req.params.email, { activeProfile: true })
    if (!unlock) return res.status(500).json({ 'error': 'cant edit this user' })

    return res.status(200).json(unlock)
}

async function editUser(req, res) {
    let validate = await validation.editUser(req, res)
    if (validate) return res.status(400).json({ 'error': validate })

    let edit = await dbUser.editUserDataBase(req.params.email, req.body)
    if (!edit) return res.status(500).json({ 'error': 'database problems.' })

    return res.status(200).json({ 'message': 'data edited' })
}

module.exports = { getUsers, censorUser, lockUser, unlockUser, editUser }

/*
    -Editar perfil [X]
        -Censurar audio (reemplazar el audio existinte por el ronreo de un gato)[X]
        -Desactivar el perfil[X]
    -Eliminar perfil[ ]
    -Ver todos los perfiles[X]
*/