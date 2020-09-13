const user = require('../models/user');
const jwt = require('jsonwebtoken');

async function createNewUser(req,res) {
    let userFromDataBase = await getUser(req.body);
    if (userFromDataBase) return res.status(403).json({ 'message': 'user already exists' })

    req.body.pw = await user.encryptPassword(req.body.pw)
    let newUser = new user(req.body)
    return res.status(201).json(await newUser.save())
}

async function login(req, res) {
    let userFromDataBase = await getUser(req.body);
    if (!userFromDataBase) return res.status(401).json({ 'message': 'user not exists' })

    let comparePassword = await user.comparePassword(req.body.pw, userFromDataBase.pw)
    if (!comparePassword) return res.status(401).json({ 'message': 'wrong password' })

    let token = jwt.sign({ 'data': req.body }, process.env.API_KEY || 'algosupersecreto1')
    if (!token) return res.status(401).json({ 'message': 'wrong auth' })

    req.session.token = token
    return res.status(200).json({ 'message': 'user acess granted', 'data': token })
}

async function getUser(data) {
    let findUserAlreadyExists = await user.findOne({ email: data.email })
    return findUserAlreadyExists
}

module.exports = { createNewUser, getUser, login }