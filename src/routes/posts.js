const express = require('express');
const posts   = express.Router();

const postsController = require('../controllers/posts');

posts.get('/',  postsController.list);
posts.post('/', postsController.create);

module.exports = posts;
