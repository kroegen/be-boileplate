import express from 'express';
import sessions from './sessions.js';
import users from './users.js';
import posts from './posts.js';
import comments from './comments.js';

const router = express.Router();

router.use('/sessions', sessions);
router.use('/users', users);
router.use('/posts', posts);
router.use('/comments', comments);

export default router;
