import { verifyAccessToken } from "../utils/auth.utils.js";

export const authenticateUser = (req, res, next) => {
  const authHeader = req.headers["authorization"] || req.headers["Authorization"];

  if (!authHeader) {
    return res.status(401).json({
      success: false,
      message: "Authorization header missing",
    });
  }

  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return res.status(401).json({
      success: false,
      message: "Invalid authorization format. Expected: Bearer <token>",
    });
  }

  const token = parts[1];

  try {
    const decoded = verifyAccessToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Access token has expired",
      });
    }

    return res.status(401).json({
      success: false,
      message: "Invalid access token",
    });
  }
};
