import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import path from 'path';
import express from 'express';
import logger from 'morgan';
import cors from 'cors';
import router from './routes/index.js';
import { handleError } from './utils/errors.js';

const app = express();
const publicPath = path.join(import.meta.dirname, 'public');

app.use(
  cors({
    origin: '*',
    methods: 'GET,POST,PATCH,DELETE',
  })
);

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(publicPath));

app.use('/api', router);

// Centralized error handler - must be last
app.use((err, req, res, next) => {
  const errorResponse = handleError(err);
  res.status(errorResponse.statusCode).json(errorResponse);
});

export default app;
