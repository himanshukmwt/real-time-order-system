import * as orderService from "../services/order.service.js";

export const createOrder = async (req, res, next) => {
  try {
    const order = await orderService.createOrderFromCart(req.user.userId);

    return res.status(201).json({
      success: true,
      message: "Order placed successfully",
      data: { order },
    });
  } catch (error) {
    next(error);
  }
};
