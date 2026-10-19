import { Router } from "express";
import * as cartController from "../controllers/cart.controller.js";
import { authenticateUser } from "../middleware/auth.middleware.js";

const router = Router();


router.get("/",authenticateUser, cartController.getCart);
router.post("/items",authenticateUser, cartController.addItem);
router.put("/items/:id",authenticateUser, cartController.updateItem);
router.delete("/items/:id",authenticateUser, cartController.removeItem);
router.delete("/",authenticateUser, cartController.clearCart);

export default router;
