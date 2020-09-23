require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser')
const session = require('express-session');
const rateLimit = require("express-rate-limit");
const helmet = require('helmet')

mongoose.connect(process.env.DATA_BASE_STRING_CONN || 'mongodb://localhost/howmynamesounds', { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false })
.then(() => console.log('Database Running [OK]'))
.catch((err) => console.log('Error connecting to database' + err))

const app = express();
const userRoute = require('./routes/user');
const feedRoute = require('./routes/feed');
const adminRoute = require('./routes/admin');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(helmet())
app.use(cors({
    origin: 'http://localhost:8080',
    credentials : true
}));
app.use(cookieParser())
app.use(session({
    secret: process.env.SESSION_KEY || 'algosupersecreto',
    resave: true,
    saveUninitialized: true,
    cookie: { secure: false, maxAge: process.env.COOKIE_MAX_AGE || 1000 * 60 * 4 }
}));
//PRODUCTION VALUE
//app.set('trust proxy', 1)

app.use('/api/user', userRoute)
app.use('/api/feed', feedRoute)
app.use('/api/admin', adminRoute)

app.listen(process.env.PORT || 3000, () => {
    console.log("Server web Running [OK]");
});

module.exports = app
