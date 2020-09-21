const path = require('path')
const multer = require('multer');

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, path.join(__dirname, '../static/audio')),
    filename: (req, file, cb) => cb(null, `${req.session.userInfo.email.split('@')[0]}_${Date.now()}.${file.originalname.split('.').pop()}`)
})
const upload = multer({
    storage: storage, limits: { fileSize: 500000 },
    fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.(mp3|wav|ogg)$/i)) return cb(new Error('Only audio files are allowed'), false);
        cb(null, true)
    }
}).single('audio')

module.exports = { upload }
