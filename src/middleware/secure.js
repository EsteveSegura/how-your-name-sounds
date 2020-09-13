const jwt = require('jsonwebtoken')

function verifyToken(req, res, next) {
    try {
        jwt.verify(req.session.token, process.env.API_KEY || 'algosupersecreto1')
        next()
    } catch (error) {
        return res.status(401).json({'message' : 'Unauthorized!'})
    }
}

module.exports = { verifyToken }