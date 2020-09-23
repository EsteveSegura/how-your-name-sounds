const express = require('express');
const router = express.Router();
const secure = require('../middleware/secure');
const rateLimit = require('../middleware/ratelimit')
const userController = require('../controllers/user.controller');

//user
router.post('/register', rateLimit.createAccountLimit, async (req, res) => await userController.createNewUser(req, res))
router.post('/login', rateLimit.loginAccountLimit, async (req, res) => await userController.login(req, res));
router.patch('/edit', [secure.verifyToken, rateLimit.editAccountLimit], async (req, res) => await userController.editUser(req, res))
router.get('/logout', [secure.verifyToken, rateLimit.apiRegularLimit], async (req, res) => userController.logOut(req, res))
router.get('/profile/:email', [secure.verifyToken, rateLimit.apiRegularLimit], async (req, res) => await userController.getUser(req, res))
router.get('/confirm/:tokenConfirm', async (req, res) => await userController.confirmMail(req, res))
router.get('/me', [secure.verifyToken, rateLimit.apiRegularLimit], async (req, res) => await userController.me(req, res))


module.exports = router

/*
    -Editar perfil [X]
        -Censurar audio (reemplazar el audio existinte por el ronreo de un gato)[X]
        -Desactivar el perfil[ ]
    -Eliminar perfil[ ]
    -Ver todos los perfiles[X]
*/