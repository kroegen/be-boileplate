const express = require('express');
const comments = express.Router();

const commentsController = require('../controllers/comments');
const { asyncHandler } = require('../utils/errors');

comments.get('/', asyncHandler(commentsController.list));
comments.post('/', asyncHandler(commentsController.create));

module.exports = comments;
