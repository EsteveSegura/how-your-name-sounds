require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const session = require('express-session');

mongoose.connect(process.env.DATA_BASE_STRING_CONN || 'mongodb://localhost/howmynamesounds', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Database Running [OK]'))
    .catch((err) => console.log('Error connecting to database' + err))

const app = express();
const api = require('./routes/api');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());
app.use(session({
    secret: process.env.SESSION_KEY || 'algosupersecreto',
    resave: true,
    saveUninitialized: true,
    cookie: { secure: false, maxAge: process.env.COOKIE_MAX_AGE || 1000 * 60 * 4 }
}));
//PRODUCTION VALUE
//app.set('trust proxy', 1)

app.use('/api', api)

app.listen(process.env.PORT || 3000, () => {
    console.log("Server web Running [OK]");
});