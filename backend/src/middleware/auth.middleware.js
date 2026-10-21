import { verifyAccessToken } from "../utils/auth.utils.js";
import redis from "../config/redis.js";

export const authenticateUser = async(req, res, next) => {
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

  let decoded;
  try {
    decoded = verifyAccessToken(token);
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

    try {
    const revoked = await redis.get(`blacklist:${token}`);
    if (revoked) {
      return res.status(401).json({
        success: false,
        message: "Token has been revoked. Please login again",
      });
    }
  } catch (err) {
    console.error("Blacklist check failed (Redis down?):", err.message);

  }
  req.user = decoded;
  req.token = token; // for logout 
  next();
  
};
