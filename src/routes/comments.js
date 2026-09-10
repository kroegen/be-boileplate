import express from 'express';
import { asyncHandler } from '../utils/errors.js';
import { list, create } from '../controllers/comments.js';

const comments = express.Router();

comments.get('/', asyncHandler(list));
comments.post('/', asyncHandler(create));

export default comments;
