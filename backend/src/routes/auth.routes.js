import { Router } from "express";
import * as authController from "../controllers/auth.controller.js";
import { authenticateUser } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/refresh", authController.refresh);
router.post("/logout", authController.logout);

router.get("/me", authenticateUser, authController.getMe);

export default router;
