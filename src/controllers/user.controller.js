const crypto = require('crypto')
const jwt = require('jsonwebtoken');
const mail = require('../libs/mail');
const user = require('../models/user');
const dbUser = require('../db/user.db');
const validation = require('../middleware/validation');
const uploadFile = require('../middleware/uploadFile');


async function createNewUser(req, res) {
    let validate = await validation.createUser(req, res)
    if (validate) return res.status(400).json({ 'error': validate })

    let userFromDataBase = await dbUser.getUserDataBase(req.body);
    if (userFromDataBase) return res.status(403).json({ 'error': 'user already exists' })

    let mailToken = crypto.createHmac('sha256', JSON.stringify(req.body)).digest('hex')
    let sendMail = await mail.sendMailTo(req.body.email, `http://localhost:3000/api/confirm/${mailToken}`)
    if (!sendMail) return res.status(500).json({ 'error': 'Mail system not working' })

    req.body.pw = await user.encryptPassword(req.body.pw)
    let newUser = new user(Object.assign(req.body, { verificationToken: mailToken }))
    return res.status(201).json(await newUser.save())
}

async function confirmMail(req, res) {
    let edit = await user.findOneAndUpdate({ verificationToken: req.params.tokenConfirm }, { verificatedUser: true })
    if (!edit) return res.status(500).json({ 'error': 'database problems.' })

    return res.status(200).json({ 'message': 'user confirmed' })
}

async function login(req, res) {
    let userFromDataBase = await dbUser.getUserDataBase(req.body);
    if (!userFromDataBase) return res.status(401).json({ 'error': 'user not exists' })

    let comparePassword = await user.comparePassword(req.body.pw, userFromDataBase.pw)
    if (!comparePassword) return res.status(401).json({ 'error': 'wrong password' })

    let token = jwt.sign({ 'data': req.body }, process.env.API_KEY || 'algosupersecreto1')
    if (!token) return res.status(401).json({ 'error': 'wrong auth' })

    if (!userFromDataBase.verificatedUser) return res.status(401).json({ 'error': 'need to confirm via mail' })

    let cookieData = JSON.stringify({ screenName: userFromDataBase.screenName, email: req.body.email })
    res.cookie('userData', cookieData, { expires: new Date(Date.now() + 9000000), httpOnly: true })

    req.session.token = token
    req.session.userInfo = { email: req.body.email, _id: userFromDataBase._id, soundPath: userFromDataBase.soundPath, isAdmin: userFromDataBase.isAdmin }
    return res.status(200).json({ 'message': 'user acess granted'})
}

async function editUser(req, res) {
    uploadFile.upload(req, res, async (err) => {
        let validate = await validation.editUser(req, res)
        if (validate) return res.status(400).json({ 'error': validate })

        if (err) return res.status(500).json({ 'error': err.toString().split('Error: ')[1] })

        let currentPath = req.file ? `${req.file.destination}/${req.file.filename}` : req.session.userInfo.soundPath
        let edit = await dbUser.editUserDataBase(req.session.userInfo.email, Object.assign({ 'soundPath': currentPath }, req.body))
        if (!edit) return res.status(500).json({ 'error': 'database problems.' })

        req.session.userInfo.soundPath = currentPath
        return res.status(200).json({ 'message': 'data edited' })
    })
}

async function feed(req, res) {
    let getFeed = await dbUser.getFeedDataBase()
    if (!getFeed) return res.status(404).json({ 'error': 'feed could not be found' })

    return res.status(200).json(getFeed)
}

async function me(req, res) {
    let userFromDataBase = await dbUser.getUserDataBase(req.session.userInfo, 'screenName email soundPath -_id')
    if (!userFromDataBase) return res.status(500).json({ 'error': 'Something went wrong' })


    return res.status(200).json(userFromDataBase)
}

async function getUser(req, res) {
    let userFromDataBase = await dbUser.getUserDataBase(req.params, 'screenName soundPath -_id')
    if (!userFromDataBase) return res.status(401).json({ 'error': 'user no exists' })

    return res.status(200).json(userFromDataBase)
}

async function logOut(req,res){
    req.session.destroy()
    res.clearCookie('userData')
    
}


module.exports = { createNewUser, login, editUser, feed, confirmMail, me, getUser, logOut }