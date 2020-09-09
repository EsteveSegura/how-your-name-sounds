const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const secure = require('../libs/secure');

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
router.post('/login', (req, res) => {
    console.log(req.body)
    console.log(req.body.user, req.body.pw)
    if (checkIfUserCanLogin(req.body.user, req.body.pw)) {
        jwt.sign({ 'data': req.body }, process.env.API_KEY || 'algosupersecreto1', (err, token) => {
            if (err) {
                res.json({ 'message': "ERROR", 'data': err });
            }
            req.session.token = token
            res.json({ 'message': "OK", 'data': token });
        })
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

