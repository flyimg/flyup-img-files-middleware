require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');

const imgRouter = require('./middleware/img-files');

const API_MEDIA_URL = process.env.API_MEDIA_URL;

/** configure CORS */
const originsWhitelist = [
    'http://localhost:4200', // this is my front-end url for development
    'http://no.clue.yet',
];
const corsOptions = {
    origin: (origin, callback) => {
        const isWhitelisted = originsWhitelist.indexOf(origin) !== -1;
        callback(null, isWhitelisted);
    },
    credentials: true,
};

const app = express();

app.use(morgan(process.env.MORGAN_LOG_TYPE || 'combined'));
app.use(bodyParser.json());
app.use(cors(corsOptions));
app.use(API_MEDIA_URL, imgRouter);

// here we pass unhandled errors (like from multer)
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
    if (err && err.error) {
        res.status(err.error).json(err);
    }
});

if (!module.parent) {
    app.listen(3000);
}
module.exports = app;
// eslint-disable-next-line no-console
console.log('Listening on port 3000');
