import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import express from 'express';
import logger from 'morgan';
import router from './routes/index.js';
import { handleError } from './utils/errors.js';
import { securityMiddleware, corsMiddleware } from './middleware/security.js';
import { sanitizeResponseMiddleware } from './middleware/sanitize.js';

const app = express();

app.use(securityMiddleware);
app.use(corsMiddleware);
app.use(sanitizeResponseMiddleware);

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/api', router);

// Centralized error handler - must be last
app.use((err, req, res, _next) => {
  const errorResponse = handleError(err);
  res.status(errorResponse.statusCode).json(errorResponse);
});

export default app;
