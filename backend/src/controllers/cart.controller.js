import * as cartService from "../services/cart.service.js";

export const getCart = async (req, res, next) => {
  try {
    const cart = await cartService.getCart(req.user.userId);
    return res.status(200).json({
      success: true,
      data: { cart },
    });
  } catch (error) {
    next(error);
  }
};

export const addItem = async (req, res, next) => {
  try {
    const { productId, quantity } = req.body;
    const cart = await cartService.addItemToCart(req.user.userId, {
      productId,
      quantity,
    });

    return res.status(200).json({
      success: true,
      message: "Item added to cart successfully",
      data: { cart },
    });
  } catch (error) {
    next(error);
  }
};

export const updateItem = async (req, res, next) => {
  try {
    const { quantity } = req.body;
    const cart = await cartService.updateCartItemQuantity(
      req.user.userId,
      req.params.id,
      quantity
    );

    return res.status(200).json({
      success: true,
      message: "Cart item updated successfully",
      data: { cart },
    });
  } catch (error) {
    next(error);
  }
};


export const removeItem = async (req, res, next) => {
  try {
    const cart = await cartService.removeCartItem(
      req.user.userId,
      req.params.id
    );

    return res.status(200).json({
      success: true,
      message: "Item removed from cart successfully",
      data: { cart },
    });
  } catch (error) {
    next(error);
  }
};


export const clearCart = async (req, res, next) => {
  try {
    const cart = await cartService.clearCart(req.user.userId);
    return res.status(200).json({
      success: true,
      message: "Cart cleared successfully",
      data: { cart },
    });
  } catch (error) {
    next(error);
  }
};
