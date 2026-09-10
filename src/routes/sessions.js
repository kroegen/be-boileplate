import express from 'express';
import { createSession } from '../controllers/sessions.js';

const sessions = express.Router();

sessions.post('/', createSession);

export default sessions;
