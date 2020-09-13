const request = require("supertest");
const chai = require("chai")
const expect = require('chai').expect;

const app = require("../src/index");

let cookie;
const data = {
    existingData: {
        mail: 'hi@gir.com',
        password: 'hola'
    }
}

describe("POST /api/login", () => {
    it("Give access when the user entered is correct", (done) => {
        request(app)
            .post("/api/login")
            .set("Accept", "application/json")
            .send({ "email": data.existingData.mail, "pw": data.existingData.password })
            .expect("Content-Type", /json/)
            .expect('set-cookie', /connect.sid/)
            .expect(200)
            .expect((res) => {
                if (!expect(res.body.message).to.be.a("string")) throw new Error("Message with incorrect forma")
                if (!expect(res.body.message).to.be.equal("user acess granted")) throw new Error("Cant login")
                if (!expect(res.body.data).to.be.a("string")) throw new Error("Not having data")
            })
            .end(function (err, res) {
                if (err) return err
                cookie = { name: res.headers['set-cookie'].toString().split('=')[0], value: res.headers['set-cookie'].toString().split('=')[1].split(';')[0] }
                done()
            })
    });

    it("Do not give access whe the user or password entered are incorrect", (done) => {
        request(app)
            .post("/api/login")
            .set("Accept", "application/json")
            .send({ "email": "wronguser@wrongmail.com", "pw": "wrongpassword" })
            .expect("Content-Type", /json/)
            .expect('set-cookie', /connect.sid/)
            .expect(401)
            .end(done)
    })
});

describe('GET /api/secret', () => {
    it('Respon with access to secret area', (done) => {
        request(app)
            .get("/api/secret")
            .set("Accept", "application/json")
            .set("Cookie", `${cookie.name}=${cookie.value}`)
            .expect("Content-Type", /json/)
            .expect(200)
            .expect((res) => {
                if (!expect(res.body.message).to.be.equal("data")) throw new Error("Cant get in to secret area")
            })
            .end(done)

    })
    it('Respon with no access to secret area', (done) => {
        request(app)
            .get("/api/secret")
            .set("Accept", "application/json")
            .set("Cookie", `${cookie.name}=${Math.random().toString(36).substring(7)}`)
            .expect("Content-Type", /json/)
            .expect(401)
            .end(done)

    })
})

describe('POST /api/register', () => {
    it('Register a new user.', (done) => {
        const mailToRegister = `${Math.random().toString(36).substring(7)}@gmail.com`
        const passwordToRegister = `${Math.random().toString(36).substring(7)}`
        request(app)
            .post('/api/register')
            .set("Accept", "application/json")
            .send({ "email": mailToRegister, "pw": passwordToRegister })
            .expect("Content-Type", /json/)
            .expect(201)
            .expect((res) => {
                if(!expect(res.body.email).to.be.equal(mailToRegister)) throw new Error("Email not match")
                if(!expect(res.body.__v).to.be.equal(0)) throw new Error("Erro with user in database")
            })
            .end(done)
    })

    it('Try to register a user that already exists',(done) =>{
        request(app)
        .post('/api/register')
            .set("Accept", "application/json")
            .send({ "email": data.existingData.mail, "pw": data.existingData.password })
            .expect("Content-Type", /json/)
            .expect(403)
            .expect((res) => {
                if(!expect(res.body.message).to.be.equal("user already exists")) throw new Error("Cant register an existing user")
            })
            .end(done)
    })
})