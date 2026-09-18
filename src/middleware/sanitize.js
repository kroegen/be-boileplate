// Response sanitization middleware to remove sensitive fields from API responses
// This ensures password hashes, salts, and secrets are never exposed in any response

const SENSITIVE_USER_FIELDS = ['passwordHash', 'salt', 'password'];

/**
 * Recursively sanitizes sensitive fields from an object
 * @param {any} data - The data to sanitize
 * @returns {any} - Sanitized data with sensitive fields removed
 */
function sanitizeObject(data) {
  if (data === null || data === undefined) {
    return data;
  }

  // Handle arrays
  if (Array.isArray(data)) {
    return data.map((item) => sanitizeObject(item));
  }

  // Handle objects
  if (typeof data === 'object') {
    const sanitized = {};
    for (const [key, value] of Object.entries(data)) {
      // Skip sensitive fields
      if (SENSITIVE_USER_FIELDS.includes(key)) {
        continue;
      }
      // Recursively sanitize nested objects/arrays
      sanitized[key] = sanitizeObject(value);
    }
    return sanitized;
  }

  // Return primitives as-is
  return data;
}

/**
 * Express middleware that sanitizes response data before sending
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next function
 */
function sanitizeResponseMiddleware(req, res, next) {
  // Store the original json method
  const originalJson = res.json.bind(res);

  // Override json method to sanitize before sending
  res.json = (data) => {
    const sanitizedData = sanitizeObject(data);
    return originalJson(sanitizedData);
  };

  next();
}

export { sanitizeResponseMiddleware, sanitizeObject, SENSITIVE_USER_FIELDS };
