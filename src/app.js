const cookieParser = require('cookie-parser');
const path         = require('path');
const express      = require('express');
const logger       = require('morgan');
const cors         = require('cors');
const app          = express();


const router     = require('./routes');
const publicPath = path.join(__dirname, 'public');

app.use(cors({
    origin: '*',
    methods: 'GET,POST,PATCH,DELETE'
}));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(publicPath));

app.use('/api', router);

module.exports = app;
