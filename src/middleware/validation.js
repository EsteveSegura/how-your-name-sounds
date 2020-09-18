const { body, validationResult } = require('express-validator')

async function createUser(req, res) {
    await body('email')
        .isEmail().withMessage('mail wrong format')
        .run(req)
    await body('pw')
        .isLength({ min: 6, max: 30 }).withMessage('must be at last 6 chars long')
        .custom(value => !/\s/.test(value)).withMessage('No spaces are allowed in the password')
        .run(req)
    await body('screenName')
        .isLength({ min: 3, max: 100 }).withMessage('must be at last 3 chars long')
        .custom(value => !/\s/.test(value)).withMessage('No spaces are allowed in the nickname')
        .trim()
        .escape()
        .run(req)


    const result = validationResult(req)
    if (!result.isEmpty()) return result.array().map(err => err.msg)[0]
    return null
}

async function editUser(req, res) {
    await body('email')
        .isEmail().withMessage('mail wrong format')
        .run(req)
    await body('pw')
        .isLength({ min: 6, max: 30 }).withMessage('must be at last 6 chars long')
        .custom(value => !/\s/.test(value)).withMessage('No spaces are allowed in the password')
        .run(req)
    await body('screenName')
        .isLength({ min: 3, max: 100 }).withMessage('must be at last 3 chars long')
        .custom(value => !/\s/.test(value)).withMessage('No spaces are allowed in the nickname')
        .trim()
        .escape()
        .run(req)


    const result = validationResult(req)
    if (!result.isEmpty()) return result.array().map(err => err.msg)[0]
    return null
}

async function editUser(req, res) {
    if (req.body.screenName) await body('screenName')
        .isLength({ min: 3, max: 12 }).withMessage('nickname can be between 3 and 12 length')
        .custom(value => !/\s/.test(value)).withMessage('No spaces are allowed in the nickname')
        .trim()
        .escape()
        .run(req);
    if (req.body.email) await body('email')
        .isEmail().withMessage('mail wrong format')
        .run(req)
    if (req.body.pw) await body('pw')
        .isLength({ min: 6 }).withMessage('password must be at least 6 chars long')
        .custom(value => !/\s/.test(value)).withMessage('No spaces are allowed in the password')
        .run(req);

    const result = validationResult(req)
    if (!result.isEmpty()) return result.array().map(err => err.msg)[0]
    return null
}

module.exports = { createUser, editUser }