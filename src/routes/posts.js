const express = require('express');
const posts = express.Router();

const postsController = require('../controllers/posts');
const { asyncHandler } = require('../utils/errors');

posts.get('/', asyncHandler(postsController.list));
posts.post('/', asyncHandler(postsController.create));

module.exports = posts;
