const user = require('../models/user');
const jwt = require('jsonwebtoken');
const path = require('path')
const multer = require('multer');
const validation = require('../middleware/validation');
const mail = require('../libs/mail');
const crypto = require('crypto')

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, path.join(__dirname, '../static/audio')),
    filename: (req, file, cb) => cb(null, `${req.session.userInfo.email.split('@')[0]}_${Date.now()}.${file.originalname.split('.').pop()}`)
})
const upload = multer({
    storage: storage, limits: { fileSize: 500000 },
    fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.(mp3|wav|ogg)$/i)) return cb(new Error('Only audio files are allowed'), false);
        cb(null, true)
    }
}).single('audio')

async function createNewUser(req, res) {
    let validate = await validation.createUser(req, res)
    if (validate) return res.status(400).json({ 'message': validate })

    let userFromDataBase = await getUserDataBase(req.body);
    if (userFromDataBase) return res.status(403).json({ 'message': 'user already exists' })

    let mailToken = crypto.createHmac('sha256', JSON.stringify(req.body)).digest('hex')
    let sendMail = await mail.sendMailTo(req.body.email, `http://localhost:3000/api/confirm/${mailToken}`)
    if (!sendMail) return res.status(500).json({ 'message': 'Mail system not working' })

    req.body.pw = await user.encryptPassword(req.body.pw)
    let newUser = new user(Object.assign(req.body, { verificationToken: mailToken }))
    return res.status(201).json(await newUser.save())
}

async function confirmMail(req, res) {
    let edit = await user.findOneAndUpdate({verificationToken: req.params.tokenConfirm}, {verificatedUser: true})
    if(!edit) return res.status(500).json({'message' : 'database problems.'})

    return res.status(200).json({'message': 'user confirmed'})
}

async function login(req, res) {
    let userFromDataBase = await getUserDataBase(req.body);
    if (!userFromDataBase) return res.status(401).json({ 'message': 'user not exists' })

    let comparePassword = await user.comparePassword(req.body.pw, userFromDataBase.pw)
    if (!comparePassword) return res.status(401).json({ 'message': 'wrong password' })

    let token = jwt.sign({ 'data': req.body }, process.env.API_KEY || 'algosupersecreto1')
    if (!token) return res.status(401).json({ 'message': 'wrong auth' })

    if(!userFromDataBase.verificatedUser) return res.status(401).json({'message' : 'need to confirm via mail'})

    req.session.token = token
    req.session.userInfo = { email: req.body.email, _id: userFromDataBase._id, soundPath: userFromDataBase.soundPath }
    return res.status(200).json({ 'message': 'user acess granted', 'data': token })
}

async function editUser(req, res) {
    upload(req, res, async (err) => {
        let validate = await validation.editUser(req, res)
        if (validate) return res.status(400).json({ 'message': validate })

        if (err) return res.status(500).json({ 'message': err.toString().split('Error: ')[1] })

        let currentPath = req.file ? `${req.file.destination}/${req.file.filename}` : req.session.userInfo.soundPath
        let edit = await editUserDataBase(req.session.userInfo.email, Object.assign({ 'soundPath': currentPath }, req.body))
        if (!edit) return res.status(500).json({ 'message': 'database problems.' })

        req.session.userInfo.soundPath = currentPath
        return res.status(200).json({ 'message': 'data edited' })
    })
}

async function feed(req, res) {
    let getFeed = await getFeedDataBase()
    if (!getFeed) return res.status(404).json({ 'message': 'feed could not be found' })

    return res.status(200).json(getFeed)
}

async function editUserDataBase(email, dataUpdate) {
    if (dataUpdate.hasOwnProperty('pw')) dataUpdate.pw = await user.encryptPassword(dataUpdate.pw)
    let doc = await user.findOneAndUpdate({ email: email }, { $set: dataUpdate }, { upsert: true, new: true })
    return doc
}

async function getUserDataBase(data) {
    let findUserAlreadyExists = await user.findOne({ email: data.email })
    return findUserAlreadyExists
}

async function getFeedDataBase() {
    let getFeed = await user.find({}, 'screenName soundPath updatedAt -_id').sort({ updatedAt: 'desc' }).limit(10)
    return getFeed
}

module.exports = { createNewUser, login, editUser, feed, confirmMail }