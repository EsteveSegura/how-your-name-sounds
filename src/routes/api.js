const express = require('express');
const router = express.Router();
const secure = require('../middleware/secure');
const userController = require('../controllers/user.controller');

router.get('/', (req, res) => res.json({ 'message': 'Welcome to API' }));

router.post('/register', async (req, res) => await userController.createNewUser(req, res))

router.post('/login', async (req, res) => await userController.login(req, res));

router.get('/feed', secure.verifyToken,  async (req, res) => await userController.feed(req, res))

router.patch('/edit', secure.verifyToken,  async (req, res, next) => await userController.editUser(req, res))

module.exports = router