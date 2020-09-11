const bcrypt = require('bcrypt');

//Creating the hash for password field in database
function cryptPassword(password){
    return new Promise((resolve,reject) => {
        bcrypt.genSalt(parseInt(process.env.SALT_ROUNDS) || 10, (err,salt) =>{
            bcrypt.hash(password,salt,(err_,hash) =>{
                if(err_){
                    reject(err_);
                }
                resolve(hash)
            })
        })
    })
}

//Compare the password coming from the user with the hash we
//already have stored in database to allow or disallow
//the private access to si
function comparePasswsord(password,hash){
    return new Promise((resolve,reject) => {
        bcrypt.compare(password, hash, (err, result) =>{
            if(err){
                reject(err)
            }
            resolve(result);
        })
    })
}

module.exports = { cryptPassword, comparePasswsord }