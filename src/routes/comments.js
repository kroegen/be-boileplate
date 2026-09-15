import express from 'express';
import { asyncHandler } from '#src/utils/errors.js';
import { list, create } from '#src/controllers/comments.js';

const comments = express.Router();

comments.get('/', asyncHandler(list));
comments.post('/', asyncHandler(create));

export default comments;
