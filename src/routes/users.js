import express from 'express';
import { asyncHandler } from '../utils/errors.js';
import { list, create } from '../controllers/users.js';

const users = express.Router();

users.get('/', asyncHandler(list));
users.post('/', asyncHandler(create));

export default users;
