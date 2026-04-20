import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key_change_in_production";

/**
 * ✅ Generate JWT token
 */
export function generateToken(userId, email) {
  return jwt.sign(
    { userId, email },
    JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || "30d" }
  );
}

/**
 * ✅ Verify JWT token
 */
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

/**
 * ✅ Auth Middleware (you already wrote correctly)
 */
export function authMiddleware(request, response, next) {
  try {
    let token = null;

    if (request.cookies && request.cookies.authToken) {
      token = request.cookies.authToken;
    }

    if (!token && request.headers.authorization?.startsWith("Bearer ")) {
      token = request.headers.authorization.substring(7);
    }

    if (!token) {
      return response.status(401).json(null);
    }

    const decoded = verifyToken(token);

    if (!decoded) {
      return response.status(401).json(null);
    }

    request.user = decoded;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    return response.status(401).json(null);
  }
}