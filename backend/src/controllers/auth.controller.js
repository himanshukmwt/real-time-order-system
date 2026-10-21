import * as authService from "../services/auth.service.js";
import { getRefreshTokenCookieOptions } from "../utils/auth.utils.js";
import redis from "../config/redis.js";

const blacklistToken = async (token, exp) => {
  const ttl = exp - Math.floor(Date.now() / 1000);
  if (ttl > 0) {
    await redis.set(`blacklist:${token}`, "1", "EX", ttl);
  }
};


export const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    const user = await authService.registerUser({ name, email, password, role });

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const { user, accessToken, refreshToken } = await authService.loginUser({
      email,
      password,
    });

    res.cookie("refreshToken", refreshToken, getRefreshTokenCookieOptions());

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        user,
        accessToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const refresh = async (req, res, next) => {
  try {
    const refreshToken = req.cookies?.refreshToken;
    const { accessToken } = await authService.refreshTokenService(refreshToken);

    return res.status(200).json({
      success: true,
      message: "Access token refreshed successfully",
      data: {
        accessToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

// export const logout = (req, res) => {

//   res.clearCookie("refreshToken", {
//     httpOnly: true,
//     secure: process.env.NODE_ENV === "production",
//     sameSite: "lax",
//   });

//   return res.status(200).json({
//     success: true,
//     message: "Logged out successfully",
//   });
// };

export const logout = async (req, res, next) => {
  try {
    await blacklistToken(req.token, req.user.exp);

    const refreshToken = req.cookies?.refreshToken;
    if (refreshToken) {
      try {
        const decoded = verifyRefreshToken(refreshToken);
        await blacklistToken(refreshToken, decoded.exp);
      } catch {
      }
    }

    res.clearCookie("refreshToken", getRefreshTokenCookieOptions());

    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await authService.getUserProfile(req.user.userId);

    return res.status(200).json({
      success: true,
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};
