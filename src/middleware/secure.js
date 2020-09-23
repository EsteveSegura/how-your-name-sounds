const jwt = require('jsonwebtoken')

function verifyToken(req, res, next) {
    try {
        jwt.verify(req.session.token, process.env.API_KEY || 'algosupersecreto1')
        next()
    } catch (error) {
        return res.status(401).json({ 'error': 'Unauthorized!' })
    }
}

function verifyAdmin(req, res, next) {
    if (!req.session.hasOwnProperty('userInfo')) return res.status(401).json({ 'error': 'Not logged in' })
    if (!req.session.userInfo.hasOwnProperty('isAdmin')) return res.status(401).json({ 'error': 'Unauthorized!' })
    next()
}

module.exports = { verifyToken, verifyAdmin }