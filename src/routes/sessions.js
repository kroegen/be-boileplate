import express from 'express';
import { create } from '#src/controllers/sessions.js';

const sessions = express.Router();

sessions.post('/', create);

export default sessions;
