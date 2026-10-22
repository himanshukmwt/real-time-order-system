import { Router } from "express";
import * as authController from "../controllers/auth.controller.js";
import { authenticateUser } from "../middleware/auth.middleware.js";
import { authIpLimiter } from '../middleware/ratelimiter.middleware.js';

const router = Router();

router.post("/register",authIpLimiter, authController.register);
router.post("/login",authIpLimiter, authController.login);
router.post("/refresh", authController.refresh);
router.post("/logout", authenticateUser,authController.logout);

router.get("/me", authenticateUser, authController.getMe);

export default router;
