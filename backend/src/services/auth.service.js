import prisma from "../lib/prisma.js";
import {
  hashPassword,
  comparePassword,
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  sanitizeUser,
} from "../utils/auth.utils.js";


export const registerUser = async ({ name, email, password }) => {
  if (!name || typeof name !== "string" || !name.trim()) {
    const error = new Error("Name is required");
    error.statusCode = 400;
    throw error;
  }

  if (!email || typeof email !== "string" || !email.trim()) {
    const error = new Error("Email is required");
    error.statusCode = 400;
    throw error;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const normalizedEmail = email.trim().toLowerCase();
  if (!emailRegex.test(normalizedEmail)) {
    const error = new Error("Invalid email format");
    error.statusCode = 400;
    throw error;
  }

  if (!password || typeof password !== "string" || password.length < 6) {
    const error = new Error("Password must be at least 6 characters long");
    error.statusCode = 400;
    throw error;
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (existingUser) {
    const error = new Error("Email is already registered");
    error.statusCode = 409;
    throw error;
  }

  const passwordHash = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      name: name.trim(),
      email: normalizedEmail,
      password: passwordHash,
    },
  });

  return sanitizeUser(user);
};

export const loginUser = async ({ email, password }) => {
  if (!email || !password) {
    const error = new Error("Email and password are required");
    error.statusCode = 400;
    throw error;
  }

  const normalizedEmail = email.trim().toLowerCase();

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (!user) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  const isPasswordValid = await comparePassword(password, user.password);
  if (!isPasswordValid) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  const tokenPayload = {
    userId: user.id,
    email: user.email,
  };

  const accessToken = generateAccessToken(tokenPayload);
  const refreshToken = generateRefreshToken({ userId: user.id });

  return {
    user: sanitizeUser(user),
    accessToken,
    refreshToken,
  };
};

export const refreshTokenService = async (refreshToken) => {
  if (!refreshToken) {
    const error = new Error("Refresh token missing");
    error.statusCode = 401;
    throw error;
  }

  let decoded;
  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch (err) {
    const error = new Error(
      err.name === "TokenExpiredError"
        ? "Refresh token has expired"
        : "Invalid refresh token"
    );
    error.statusCode = 401;
    throw error;
  }

  const user = await prisma.user.findUnique({
    where: { id: decoded.userId },
  });

  if (!user) {
    const error = new Error("User no longer exists");
    error.statusCode = 401;
    throw error;
  }

  const newAccessToken = generateAccessToken({
    userId: user.id,
    email: user.email,
  });

  return { accessToken: newAccessToken };
};


export const getUserProfile = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  return sanitizeUser(user);
};
