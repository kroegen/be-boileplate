const express  = require('express');
const comments = express.Router();

const commentsController = require('../controllers/comments');

comments.get('/',  commentsController.list);
comments.post('/', commentsController.create);

module.exports = comments;
