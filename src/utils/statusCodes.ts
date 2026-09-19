// Response status codes for API envelope
export const STATUS_SUCCESS = 1 as const;
export const STATUS_FAILURE = 0 as const;

// HTTP status codes
export const HTTP_OK = 200 as const;
export const HTTP_CREATED = 201 as const;
export const HTTP_BAD_REQUEST = 400 as const;
export const HTTP_UNAUTHORIZED = 401 as const;
export const HTTP_FORBIDDEN = 403 as const;
export const HTTP_NOT_FOUND = 404 as const;
export const HTTP_CONFLICT = 409 as const;
export const HTTP_INTERNAL_ERROR = 500 as const;
