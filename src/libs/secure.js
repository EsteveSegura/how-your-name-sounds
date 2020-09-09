
//Fucntion to verify tokens comming from server
function verifyToken(req, res, next) {
    const beareHeader = req.headers['authorization'];

    //We are reciving data like : "Bearer $2hio128398z813"
    //So we only need to keep the token part
    if (typeof beareHeader !== "undefined") {
        const bearer = beareHeader.split(" ");
        const bearerToken = bearer[1]
        req.token = bearerToken
        next() //when we have all work done, continue with the route logic
    } else {
        next()
    }
}

module.exports = { verifyToken }