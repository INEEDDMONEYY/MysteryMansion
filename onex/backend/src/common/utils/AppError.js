// utils/AppError.js
// Custom Error class avoids repetitive try/catch blocks and gives consistent error responses.
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

export default AppError;
