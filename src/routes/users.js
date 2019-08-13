const express  = require('express');
const users    = express.Router();

const usersController = require('../controllers/users');

users.get('/',  usersController.list);
users.post('/', usersController.create);

module.exports = users;
