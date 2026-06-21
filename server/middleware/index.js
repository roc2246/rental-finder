import jwt from "jsonwebtoken";

/**
 * Validates rental query parameters (page, pageSize, filters)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {void}
 */
export function validateRentalQuery(req, res, next) {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pagesize || req.query.pageSize) || 20;

    // Validate page range
    if (page < 1 || page > 10000) {
      return res.status(400).json({
        error: "Bad Request",
        message: "Page must be between 1 and 10000"
      });
    }

    // Validate pageSize range
    if (pageSize < 1 || pageSize > 100) {
      return res.status(400).json({
        error: "Bad Request",
        message: "PageSize must be between 1 and 100"
      });
    }

    // Whitelist allowed filter keys
    const allowedFilters = ["location", "category", "bedrooms", "dailyRate", "price"];
    if (req.query.filters) {
      try {
        const filters = JSON.parse(req.query.filters);
        for (const key in filters) {
          if (!allowedFilters.includes(key)) {
            return res.status(400).json({
              error: "Bad Request",
              message: `Filter '${key}' is not allowed. Allowed filters: ${allowedFilters.join(", ")}`
            });
          }
        }
      } catch (e) {
        return res.status(400).json({
          error: "Bad Request",
          message: "Filters must be a valid JSON object"
        });
      }
    }

    next();
  } catch (error) {
    res.status(500).json({
      error: "Internal Server Error",
      message: "Validation middleware error"
    });
  }
}

/**
 * Authenticates requests using JWT from Authorization header
 * Expects: "Authorization: Bearer <token>"
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {void}
 */
export function authenticateToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "No authorization token provided"
      });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error("JWT_SECRET not configured");
      return res.status(500).json({
        error: "Internal Server Error",
        message: "Authentication configuration error"
      });
    }

    jwt.verify(token, secret, (err, user) => {
      if (err) {
        return res.status(403).json({
          error: "Forbidden",
          message: "Invalid or expired token"
        });
      }
      req.user = user;
      next();
    });
  } catch (error) {
    res.status(500).json({
      error: "Internal Server Error",
      message: "Authentication error"
    });
  }
}

/**
 * Optional authentication middleware - attaches user if token is valid,
 * but allows request to continue if no token or invalid token
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {void}
 */
export function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      req.user = null;
      return next();
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      req.user = null;
      return next();
    }

    jwt.verify(token, secret, (err, user) => {
      req.user = err ? null : user;
      next();
    });
  } catch (error) {
    req.user = null;
    next();
  }
}

/**
 * Validates MongoDB ObjectId format
 * @param {string} id - String to validate
 * @returns {boolean}
 */
export function isValidObjectId(id) {
  return /^[0-9a-f]{24}$/i.test(id);
}

/**
 * Middleware that validates MongoDB ID format in request params
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {void}
 */
export function validateObjectId(req, res, next) {
  const { id } = req.params;

  if (!id || !isValidObjectId(id)) {
    return res.status(400).json({
      error: "Bad Request",
      message: "Invalid rental ID format"
    });
  }

  next();
}
