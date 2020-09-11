const user = require('../models/user');

async function createNewUser(data){
    return new Promise(async(resolve,reject) => {
        let findUserAlreadyExists = await user.findOne({email: data.email})
        if(findUserAlreadyExists){
            resolve('User already exist in database')
        }else{
            let newUser = new user(data)
            let savedUser = await newUser.save()
            resolve('User added to database correctly')
        }
    })
}

async function checkIfUserExists(data){
    return new Promise(async(resolve,reject) => {
        let findUserAlreadyExists = await user.findOne({email: data.email})
        resolve(findUserAlreadyExists)
    })
}
module.exports = { createNewUser, checkIfUserExists }