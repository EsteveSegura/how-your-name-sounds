const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const secure = require('../libs/secure');
const userActions = require('../libs/userActions');
const password = require('../libs/password')

//A simulation to test JWT
//TEMP START
const db = [{ "user": "admin", "pw": "123456789" }, { "user": "user", "pw": "lolo" }]

function checkIfUserCanLogin(usr, pw) {
    for (let i = 0; i < db.length; i++) {
        if (usr == db[i].user && pw == db[i].pw) {
            return true
        }
    }
    return false
}
//TEMP END

router.get('/', (req, res) => {
    res.json({ 'message': 'Welcome to API' });
});

//UserRoutes
router.post('/register', async(req,res) => {
    req.body.pw = await password.cryptPassword(req.body.pw)
    let registerUser = await userActions.createNewUser(req.body)
    res.json(registerUser)
})

router.post('/login', async(req, res) => {
    let userFromDataBase = await userActions.checkIfUserExists(req.body);
    if (userFromDataBase) {
        let comparePassword = await password.comparePasswsord(req.body.pw,userFromDataBase.pw)
        if(comparePassword){
            jwt.sign({ 'data': req.body }, process.env.API_KEY || 'algosupersecreto1', (err, token) => {
                if (err) {
                    res.json({ 'message': "ERROR", 'data': err });
                }
                req.session.token = token
                res.json({ 'message': "OK", 'data': token });
            })
        }else{
            res.status(403)
        }
    } else {
        res.json({ 'message': "ERROR WRONG USER", 'data': req.body });
    }
});

router.post('/upload', (req, res) => { //Secret
    res.json({ 'message': "OK" });
});

//TEMP ROUTE, JUST FOR TESTING
router.get('/secret', secure.verifyToken, (req, res, next) => {
    req.token = req.session.token
    //console.log(req.session.token)
    jwt.verify(req.token, process.env.API_KEY || 'algosupersecreto1', (err, data) => {
        if (err) {
            console.log(err)
            res.sendStatus(403);
        }
        res.json({ 'message': data })
    })
});

router.get('/getuser/:id', (req, res) => {
    res.json({ 'message': "OK" });
});

router.get('/me', (req, res) => { //Secret
    res.json({ 'message': "OK" });
});

//PortalRoutes
router.get('/feed', (req, res) => {
    res.json({ 'message': "OK" });
});

module.exports = router

