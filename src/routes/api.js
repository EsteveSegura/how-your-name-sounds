const express = require('express');
const router = express.Router();
const secure = require('../middleware/secure');
const userController = require('../controllers/user.controller');

router.get('/', (req, res) => res.json({ 'message': 'Welcome to API' }));

//UserRoutes
router.post('/register', async (req, res) => await userController.createNewUser(req, res))

router.post('/login', async (req, res) => await userController.login(req, res));

//TEMP ROUTE, JUST FOR TESTING
router.get('/secret', secure.verifyToken, (req, res, next) => res.json({ 'message': 'data' }));
//TEMP ROUTE, JUST FOR TESTING

module.exports = router