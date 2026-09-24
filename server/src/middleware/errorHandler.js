export class AppError extends Error {
  constructor(message, statusCode = 500, details = undefined) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.details = details;
  }
}

export function errorHandler(err, _req, res, _next) {
  const statusCode = err.statusCode || 500;
  const payload = {
    error: {
      message: err.message || "Internal server error",
      ...(err.details ? { details: err.details } : {}),
    },
  };

  if (process.env.NODE_ENV !== "production") {
    payload.error.stack = err.stack;
  }

  console.error("[error]", statusCode, err.message, err.details || "");
  res.status(statusCode).json(payload);
}
