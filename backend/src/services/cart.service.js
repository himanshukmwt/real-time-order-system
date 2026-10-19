import prisma from "../lib/prisma.js";

const formatCartResponse = (cart) => {
  let totalAmount = 0;
  let totalItems = 0;

  const items = (cart.items || []).map((item) => {
    const unitPrice = Number(item.product.price);
    const subtotal = Number((unitPrice * item.quantity).toFixed(2));
    totalAmount += subtotal;
    totalItems += item.quantity;

    return {
      id: item.id,
      productId: item.productId,
      quantity: item.quantity,
      product: {
        id: item.product.id,
        name: item.product.name,
        description: item.product.description,
        price: unitPrice,
        stock: item.product.stock,
        category: item.product.category,
        imageUrl: item.product.imageUrl,
      },
      subtotal,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    };
  });

  return {
    id: cart.id,
    userId: cart.userId,
    items,
    totalItems,
    totalAmount: Number(totalAmount.toFixed(2)),
    createdAt: cart.createdAt,
    updatedAt: cart.updatedAt,
  };
};


export const getOrCreateCart = async (userId) => {
  let cart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: { product: true },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!cart) {
    cart = await prisma.cart.create({
      data: { userId },
      include: {
        items: {
          include: { product: true },
          orderBy: { createdAt: "asc" },
        },
      },
    });
  }

  return cart;
};

export const getCart = async (userId) => {
  const cart = await getOrCreateCart(userId);
  return formatCartResponse(cart);
};


export const addItemToCart = async (userId, { productId, quantity = 1 }) => {
  if (!productId || typeof productId !== "string" || !productId.trim()) {
    const error = new Error("Product ID is required and must be a string");
    error.statusCode = 400;
    throw error;
  }

  const parsedQuantity = Number(quantity);
  if (!Number.isInteger(parsedQuantity) || parsedQuantity <= 0) {
    const error = new Error("Quantity must be an integer greater than 0");
    error.statusCode = 400;
    throw error;
  }

  // Verify product exists
  const product = await prisma.product.findUnique({
    where: { id: productId.trim() },
  });

  if (!product) {
    const error = new Error("Product not found");
    error.statusCode = 404;
    throw error;
  }

  // Check product stock
  if (product.stock <= 0) {
    const error = new Error("Product is out of stock");
    error.statusCode = 400;
    throw error;
  }

  const cart = await getOrCreateCart(userId);
  const existingItem = cart.items.find((item) => item.productId === product.id);

  if (existingItem) {
    const newQuantity = existingItem.quantity + parsedQuantity;
    if (newQuantity > product.stock) {
      const error = new Error(
        `Cannot add ${parsedQuantity} item(s). Total requested (${newQuantity}) exceeds available stock (${product.stock})`
      );
      error.statusCode = 400;
      throw error;
    }

    await prisma.cartItem.update({
      where: { id: existingItem.id },
      data: { quantity: newQuantity },
    });
  } else {
    if (parsedQuantity > product.stock) {
      const error = new Error(
        `Requested quantity (${parsedQuantity}) exceeds available stock (${product.stock})`
      );
      error.statusCode = 400;
      throw error;
    }

    await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId: product.id,
        quantity: parsedQuantity,
      },
    });
  }

  return await getCart(userId);
};

export const updateCartItemQuantity = async (userId, cartItemId, quantity) => {
  if (!cartItemId || typeof cartItemId !== "string" || !cartItemId.trim()) {
    const error = new Error("Cart item ID is required");
    error.statusCode = 400;
    throw error;
  }

  const parsedQuantity = Number(quantity);
  if (!Number.isInteger(parsedQuantity) || parsedQuantity <= 0) {
    const error = new Error("Quantity must be an integer greater than 0");
    error.statusCode = 400;
    throw error;
  }

  const cart = await getOrCreateCart(userId);
  const item = cart.items.find((i) => i.id === cartItemId.trim());

  if (!item) {
    const error = new Error("Cart item not found");
    error.statusCode = 404;
    throw error;
  }

  if (parsedQuantity > item.product.stock) {
    const error = new Error(
      `Requested quantity (${parsedQuantity}) exceeds available stock (${item.product.stock})`
    );
    error.statusCode = 400;
    throw error;
  }

  await prisma.cartItem.update({
    where: { id: item.id },
    data: { quantity: parsedQuantity },
  });

  return await getCart(userId);
};


export const removeCartItem = async (userId, cartItemId) => {
  if (!cartItemId || typeof cartItemId !== "string" || !cartItemId.trim()) {
    const error = new Error("Cart item ID is required");
    error.statusCode = 400;
    throw error;
  }

  const cart = await getOrCreateCart(userId);
  const item = cart.items.find((i) => i.id === cartItemId.trim());

  if (!item) {
    const error = new Error("Cart item not found");
    error.statusCode = 404;
    throw error;
  }

  await prisma.cartItem.delete({
    where: { id: item.id },
  });

  return await getCart(userId);
};


export const clearCart = async (userId) => {
  const cart = await getOrCreateCart(userId);

  await prisma.cartItem.deleteMany({
    where: { cartId: cart.id },
  });

  return {
    id: cart.id,
    userId: cart.userId,
    items: [],
    totalItems: 0,
    totalAmount: 0,
    createdAt: cart.createdAt,
    updatedAt: cart.updatedAt,
  };
};
