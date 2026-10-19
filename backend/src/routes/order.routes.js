import { Router } from "express";
import * as orderController from "../controllers/order.controller.js";
import { authenticateUser } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/", authenticateUser, orderController.createOrder);

export default router;
