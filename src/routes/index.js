const express = require('express');
const router  = express.Router();

const sessions  = require('./sessions');
const users     = require('./users');
const posts     = require('./posts');
const comments  = require('./comments');

// router.use((req, res, next) => {
//     console.log(req);
//     res.header("Access-Control-Allow-Origin", "*");
//     res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//     next();
// });

router.use('/sessions', sessions);
router.use('/users',    users);
router.use('/posts',    posts);
router.use('/comments', comments);

module.exports = router;
