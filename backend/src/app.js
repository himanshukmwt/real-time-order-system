import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes.js";

const app = express();

const allowedOrigin = process.env.CLIENT_URL || "http://localhost:3000";

app.use(
  cors({
    origin: allowedOrigin,
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// Base Route
app.get("/", (req, res) => {
  res.json({
    message: "Real-Time Order Processing API is running",
  });
});

// Authentication Routes
app.use("/api/auth", authRoutes);

// Centralized Error Handler Middleware
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

export default app;