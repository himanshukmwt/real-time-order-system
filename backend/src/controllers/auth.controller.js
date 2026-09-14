import * as authService from "../services/auth.service.js";
import { getRefreshTokenCookieOptions } from "../utils/auth.utils.js";

export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const user = await authService.registerUser({ name, email, password });

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

export const logout = (req, res) => {
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });

  return res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
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
