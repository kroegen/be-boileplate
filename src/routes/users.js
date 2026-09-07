const express  = require('express');
const users    = express.Router();

const usersController = require('../controllers/users');
const { asyncHandler } = require('../utils/errors');

users.get('/',  asyncHandler(usersController.list));
users.post('/', asyncHandler(usersController.create));

module.exports = users;
