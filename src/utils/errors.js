// Error contract for API responses
// All errors follow this shape to ensure consistency

const ERROR_TYPES = {
  VALIDATION: 'ValidationError',
  DUPLICATE_KEY: 'DuplicateKeyError',
  MALFORMED_JSON: 'MalformedJSONError',
  DATABASE: 'DatabaseError',
  NOT_FOUND: 'NotFoundError',
  UNAUTHORIZED: 'UnauthorizedError',
};

const ERROR_MESSAGES = {
  VALIDATION: 'Validation failed',
  DUPLICATE_KEY: 'Duplicate key error',
  MALFORMED_JSON: 'Malformed JSON in request body',
  DATABASE: 'Database operation failed',
  NOT_FOUND: 'Resource not found',
  UNAUTHORIZED: 'Unauthorized',
};

// Error response envelope
function createErrorResponse(error, type, message, statusCode) {
  return {
    status: 0,
    data: {
      errors: [
        {
          type: type,
          message: message,
          ...(error.details && { details: error.details }),
        },
      ],
      message: message,
    },
    statusCode: statusCode,
  };
}

// Error handlers by type
function handleValidationError(error) {
  return createErrorResponse(error, ERROR_TYPES.VALIDATION, ERROR_MESSAGES.VALIDATION, 400);
}

function handleDuplicateKeyError(error) {
  return createErrorResponse(error, ERROR_TYPES.DUPLICATE_KEY, ERROR_MESSAGES.DUPLICATE_KEY, 409);
}

function handleMalformedJSONError(error) {
  return createErrorResponse(error, ERROR_TYPES.MALFORMED_JSON, ERROR_MESSAGES.MALFORMED_JSON, 400);
}

function handleDatabaseError(error) {
  return createErrorResponse(error, ERROR_TYPES.DATABASE, ERROR_MESSAGES.DATABASE, 500);
}

function handleNotFoundError(error) {
  return createErrorResponse(error, ERROR_TYPES.NOT_FOUND, ERROR_MESSAGES.NOT_FOUND, 404);
}

function handleUnauthorizedError(error) {
  return createErrorResponse(error, ERROR_TYPES.UNAUTHORIZED, ERROR_MESSAGES.UNAUTHORIZED, 401);
}

// Async error wrapper - catches errors in async route handlers
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

// Centralized error handler
function handleError(error) {
  // Malformed JSON from Express/body-parser
  if (error instanceof SyntaxError) {
    return handleMalformedJSONError(error);
  }

  // Mongoose validation errors
  if (error && error.name === 'ValidationError') {
    return handleValidationError(error);
  }

  // Mongoose duplicate key errors
  if (error && error.name === 'MongoServerError' && error.code === 11000) {
    return handleDuplicateKeyError(error);
  }

  // Cast errors (invalid ObjectId, etc.)
  if (error && error.name === 'CastError') {
    return handleValidationError(error);
  }

  // Default to database/error for unknown errors
  return handleDatabaseError(error);
}

export {
  ERROR_TYPES,
  ERROR_MESSAGES,
  createErrorResponse,
  handleValidationError,
  handleDuplicateKeyError,
  handleMalformedJSONError,
  handleDatabaseError,
  handleNotFoundError,
  handleUnauthorizedError,
  handleError,
  asyncHandler,
};
