const cookieParser = require('cookie-parser');
const path = require('path');
const express = require('express');
const logger = require('morgan');
const cors = require('cors');
const app = express();

const router = require('./routes');
const publicPath = path.join(__dirname, 'public');
const { handleError } = require('./utils/errors');

app.use(
  cors({
    origin: '*',
    methods: 'GET,POST,PATCH,DELETE',
  })
);

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(publicPath));

app.use('/api', router);

// Centralized error handler - must be last
app.use((err, req, res, next) => {
  const errorResponse = handleError(err);
  res.status(errorResponse.statusCode).json(errorResponse);
});

module.exports = app;
