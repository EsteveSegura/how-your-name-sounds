const express = require('express');
const router = express.Router();
const secure = require('../middleware/secure');
const rateLimit = require('../middleware/ratelimit')
const userController = require('../controllers/user.controller');
const adminController = require('../controllers/admin.controller');

//feed
router.get('/', [secure.verifyToken, rateLimit.apiRegularLimit], async (req, res) => await userController.feed(req, res))


module.exports = router