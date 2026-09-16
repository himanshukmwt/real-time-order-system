import { Router } from "express";
import * as productController from "../controllers/product.controller.js";
import { authenticateUser } from "../middleware/auth.middleware.js";
import { adminMiddleware } from "../middleware/admin.middleware.js";

const router = Router();

// Public Routes
router.get("/", productController.getProducts);
router.get("/:id", productController.getProduct);

// Admin-Only Protected Routes
router.post("/", authenticateUser, adminMiddleware, productController.createProduct);
router.put("/:id", authenticateUser, adminMiddleware, productController.updateProduct);
router.delete("/:id", authenticateUser, adminMiddleware, productController.deleteProduct);

export default router;
