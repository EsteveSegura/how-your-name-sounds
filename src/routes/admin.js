const express = require('express');
const router = express.Router();
const secure = require('../middleware/secure');
const rateLimit = require('../middleware/ratelimit')
const adminController = require('../controllers/admin.controller');

//admin
router.get('/getusers', secure.verifyAdmin, async (req, res) => await adminController.getUsers(req, res))
router.patch('/edit/:email', secure.verifyAdmin, async (req, res) => await adminController.editUser(req, res))
router.patch('/censor/:email', secure.verifyAdmin, async (req, res) => await adminController.censorUser(req, res))
router.patch('/lock/:email', secure.verifyAdmin, async (req, res) => await adminController.lockUser(req, res))
router.patch('/unlock/:email', secure.verifyAdmin, async (req, res) => await adminController.unlockUser(req, res))

module.exports = router