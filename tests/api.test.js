const request = require("supertest");
const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, '../src/.env') })
const chai = require("chai")
const expect = require('chai').expect;

const app = require("../src/index");

let cookie;
let verificationToken;
let userAlawaysPresent = "girlazote@gmail.com"
const data = {
    existingData: {
        mail: `${Math.random().toString(36).substring(7)}@gir.com`,
        password: `${Math.random().toString(36).substring(3)}`,
        screenName: `${Math.random().toString(36).substring(7)}`
    }
}

describe('POST /api/user/register', () => {
    it('Register a new user.', (done) => {
        request(app)
            .post('/api/user/register')
            .set("Accept", "application/json")
            .send({ "email": data.existingData.mail, "pw": data.existingData.password, 'screenName': data.existingData.screenName })
            .expect("Content-Type", /json/)
            .expect(201)
            .end(function (err, res) {
                if (err) done(err)
                expect(res.body.email).to.be.equal(data.existingData.mail)
                expect(res.body.__v).to.be.equal(0)
                verificationToken = res.body.verificationToken
                done()
            })
    })

    it('Try to register a new user with wrong mail.', (done) => {
        request(app)
            .post('/api/user/register')
            .set("Accept", "application/json")
            .send({ "email": '234asd4gmail.com', "pw": data.existingData.password, 'screenName': data.existingData.screenName })
            .expect("Content-Type", /json/)
            .expect(400)
            .end(function (err, res) {
                if (err) done(err)
                expect(res.body.error).to.be.equal('mail wrong format')
                done()
            })
    })

    it('Register a new user. With incorrect password', (done) => {
        request(app)
            .post('/api/user/register')
            .set("Accept", "application/json")
            .send({ "email": `new${data.existingData.mail}`, "pw": 'da', "screenName": data.existingData.screenName })
            .expect("Content-Type", /json/)
            .expect(400)
            .end(function (err, res) {
                if (err) done(err)
                expect(res.body.error).to.be.equal("must be at last 6 chars long")
                done()
            })
    })

    it('Register a new user. With incorrect screenName', (done) => {
        request(app)
            .post('/api/user/register')
            .set("Accept", "application/json")
            .send({ "email": `new${data.existingData.mail}`, "pw": Math.random().toString(36).substring(3), "screenName": "ni" })
            .expect("Content-Type", /json/)
            .expect(400)
            .end(function (err, res) {
                if (err) done(err)
                expect(res.body.error).to.be.equal("must be at last 3 chars long")
                done()
            })
    })

    it('Try to register a user that already exists', (done) => {
        request(app)
            .post('/api/user/register')
            .set("Accept", "application/json")
            .send({ "email": data.existingData.mail, "pw": data.existingData.password, 'screenName': data.existingData.screenName })
            .expect("Content-Type", /json/)
            .expect(403)
            .end(function (err, res) {
                if (err) done(err)
                expect(res.body.error).to.be.equal("user already exists")
                done()
            })
    })
})


describe("GET /api/user/confirm/:tokenConfirm", () => {
    it("confirmation via mail", (done) => {
        request(app)
            .get(`/api/user/confirm/${verificationToken}`)
            .set("Accept", "application/json")
            .expect("Content-Type", /json/)
            .expect("set-cookie", /connect.sid/)
            .expect(200)
            .end(function (err, res) {
                if (err) done(err)
                expect(res.body.message).to.be.equal("user confirmed")
                done()
            })
    })
})

describe("POST /api/user/login", () => {
    it("Give access when the user entered is correct", (done) => {
        request(app)
            .post("/api/user/login")
            .set("Accept", "application/json")
            .send({ "email": data.existingData.mail, "pw": data.existingData.password })
            .expect("Content-Type", /json/)
            .expect('set-cookie', /connect.sid/)
            .expect('set-cookie', /userData/)
            .expect(200)
            .end(function (err, res) {
                if (err) done(err)
                expect(res.body.message).to.be.a("string")
                expect(res.body.message).to.be.equal("user acess granted")
                cookie = { name: res.headers['set-cookie'][1].toString().split('=')[0], value: res.headers['set-cookie'][1].toString().split('=')[1].split(';')[0] }
                done()
            })
    });

    it("Do not give access whe the user or password entered are incorrect", (done) => {
        request(app)
            .post("/api/user/login")
            .set("Accept", "application/json")
            .send({ "email": "wronguser@wrongmail.com", "pw": "wrongpassword" })
            .expect("Content-Type", /json/)
            .expect('set-cookie', /connect.sid/)
            .expect(401)
            .end(done)
    })
});

describe("PATCH /api/user/edit", () => {
    it("Upload file", (done) => {
        request(app)
            .patch("/api/user/edit")
            .set("Accept", "application/json")
            .set("Cookie", `${cookie.name}=${cookie.value}`)
            .expect("Content-Type", /json/)
            .attach('audio', 'tests/attach/enserio.mp3')
            .expect(200)
            .end(function (err, res) {
                if (err) return done(err)
                expect(res.body.message).to.be.equal("data edited")
                done()
            })
    });
    it("Upload wrong file type", (done) => {
        request(app)
            .patch("/api/user/edit")
            .set("Accept", "application/json")
            .set("Cookie", `${cookie.name}=${cookie.value}`)
            .expect("Content-Type", /json/)
            .attach('audio', 'tests/attach/screen.png')
            .expect(500)
            .end(function (err, res) {
                if (err) return done(err)
                expect(res.body.error).to.be.equal("Only audio files are allowed")
                done()
            })
    });

    it("Upload huge file ", (done) => {
        request(app)
            .patch("/api/user/edit")
            .set("Accept", "application/json")
            .set("Cookie", `${cookie.name}=${cookie.value}`)
            .expect("Content-Type", /json/)
            .attach('audio', 'tests/attach/hugeFile.mp3')
            .expect(500)
            .end(function (err, res) {
                if (err) return done(err)
                expect(res.body.error).to.be.equal("File too large")
                done()
            })
    });

    it("Try to upload file without login ", (done) => {
        request(app)
            .patch("/api/user/edit")
            .set("Accept", "application/json")
            .expect("Content-Type", /json/)
            .attach('audio', 'tests/attach/enserio.mp3')
            .expect(401)
            .end(function (err, res) {
                if (err) return done(err)
                expect(res.body.error).to.be.equal("Unauthorized!")
                done()
            })
    });

    it("Edit data without uploading data ", (done) => {
        request(app)
            .patch("/api/user/edit")
            .set("Accept", "application/json")
            .expect("Content-Type", /json/)
            .set("Cookie", `${cookie.name}=${cookie.value}`)
            .send({ "screenName": `${Math.random().toString(36).substring(7)}`, "pw": `newPassword` })
            .expect(200)
            .end(function (err, res) {
                if (err) return done(err)
                expect(res.body.message).to.be.equal("data edited")
                done()
            })
    });
})

describe("GET /api/feed", () => {
    it('Get feed when user is loggedin', (done) => {
        request(app)
            .get("/api/feed")
            .set("Accept", "application/json")
            .set("Cookie", `${cookie.name}=${cookie.value}`)
            .expect("Content-Type", /json/)
            .expect(200)
            .end(function (err, res) {
                if (err) done(err)
                expect(res.body).to.be.an("Array")
                done()
            })
    })

    it('Get feed when user is loggedin', (done) => {
        request(app)
            .get("/api/feed")
            .set("Accept", "application/json")
            .set("Cookie", `${cookie.name}=${Math.random().toString(36).substring(7)}`)
            .expect("Content-Type", /json/)
            .expect(401)
            .end(function (err, res) {
                if (err) done(err)
                expect(res.body.error).to.be.equal("Unauthorized!")
                done()
            })
    })
})

describe("GET /api/user/me", () => {
    it("get my own info", (done) => {
        request(app)
            .get(`/api/user/me`)
            .set("Accept", "application/json")
            .set("Cookie", `${cookie.name}=${cookie.value}`)
            .expect("Content-Type", /json/)
            .expect(200)
            .end(function (err, res) {
                if (err) done(err)
                expect(res.body.email).to.be.a("String")
                expect(res.body.soundPath).to.be.a("String")
                expect(res.body.screenName).to.be.a("String")
                done()
            })
    })

    it("try to get info without login", (done) => {
        request(app)
            .get(`/api/user/me`)
            .set("Accept", "application/json")
            .set("Cookie", `${cookie.name}=${Math.round(Math.random)}`)
            .expect("Content-Type", /json/)
            .expect(401)
            .end(function (err, res) {
                if (err) done(err)
                expect(res.body.error).to.be.equal("Unauthorized!")
                done()
            })
    })
})

describe("GET /api/user/profile/:email", () => {
    it("get info about user", (done) => {
        request(app)
            .get(`/api/user/profile/${userAlawaysPresent}`)
            .set("Accept", "application/json")
            .set("Cookie", `${cookie.name}=${cookie.value}`)
            .expect("Content-Type", /json/)
            .expect(200)
            .end(function (err, res) {
                if (err) done(err)
                expect(res.body.soundPath).to.be.a("String")
                expect(res.body.screenName).to.be.a("String")
                done()
            })
    })

    it("try to get info about 404 user", (done) => {
        request(app)
            .get(`/api/user/profile/${Math.round(Math.random)}`)
            .set("Accept", "application/json")
            .set("Cookie", `${cookie.name}=${cookie.value}`)
            .expect("Content-Type", /json/)
            .expect(401)
            .end(function (err, res) {
                if (err) done(err)
                expect(res.body.error).to.be.equal("user no exists")
                
                done()
            })
    })

})