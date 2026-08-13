const jwt = require('jsonwebtoken');
const { errorResponse } = require('../utils/helpers');

/**
 * JWT authentication middleware.
 * Protects admin routes by verifying the Bearer token.
 */
function authenticateAdmin(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return errorResponse(res, 'Access denied. No token provided.', 401);
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== 'admin') {
      return errorResponse(res, 'Access denied. Admin privileges required.', 403);
    }

    req.admin = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return errorResponse(res, 'Token has expired.', 401);
    }
    return errorResponse(res, 'Invalid token.', 401);
  }
}

module.exports = { authenticateAdmin };
