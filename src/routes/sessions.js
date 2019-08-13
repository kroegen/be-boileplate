const express  = require('express');
const sessions = express.Router();

const sessionsController = require('../controllers/sessions');

sessions.post('/', sessionsController.create);

module.exports = sessions;
