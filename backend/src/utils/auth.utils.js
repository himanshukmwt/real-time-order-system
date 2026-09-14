import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";


export const hashPassword = async (password) => {
  return await bcrypt.hash(password, 10);
};


export const comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

export const generateAccessToken = (payload) => {
  const secret = process.env.JWT_ACCESS_SECRET;
  if (!secret) {
    throw new Error("JWT_ACCESS_SECRET environment variable is not defined");
  }
  const expiresIn = process.env.JWT_ACCESS_EXPIRES_IN || "15m";
  return jwt.sign(payload, secret, { expiresIn });
};

export const generateRefreshToken = (payload) => {
  const secret = process.env.JWT_REFRESH_SECRET;
  if (!secret) {
    throw new Error("JWT_REFRESH_SECRET environment variable is not defined");
  }
  const expiresIn = process.env.JWT_REFRESH_EXPIRES_IN || "7d";
  return jwt.sign(payload, secret, { expiresIn });
};

export const verifyAccessToken = (token) => {
  const secret = process.env.JWT_ACCESS_SECRET;
  if (!secret) {
    throw new Error("JWT_ACCESS_SECRET environment variable is not defined");
  }
  return jwt.verify(token, secret);
};


export const verifyRefreshToken = (token) => {
  const secret = process.env.JWT_REFRESH_SECRET;
  if (!secret) {
    throw new Error("JWT_REFRESH_SECRET environment variable is not defined");
  }
  return jwt.verify(token, secret);
};

export const sanitizeUser = (user) => {
  if (!user) return null;
  const { password, passwordHash, ...safeUser } = user;
  return safeUser;
};


export const getRefreshTokenCookieOptions = () => {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days 
  };
};
