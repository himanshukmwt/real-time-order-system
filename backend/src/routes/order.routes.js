import { Router } from "express";
import * as orderController from "../controllers/order.controller.js";
import { authenticateUser } from "../middleware/auth.middleware.js";
import { orderLimiter } from '../middleware/ratelimiter.middleware.js';

const router = Router();

router.post("/", authenticateUser,orderLimiter, orderController.createOrder);

export default router;
