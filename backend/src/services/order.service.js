import { Prisma } from "@prisma/client";
import prisma from "../lib/prisma.js";
import { getOrCreateCart } from "./cart.service.js";
import { deleteByPrefix } from "../utils/cache.utils.js";

export const createOrderFromCart = async (userId) => {
  const cart = await getOrCreateCart(userId);

  if (!cart.items || cart.items.length === 0) {
    const error = new Error(
      "Cart is empty. Add items before placing an order."
    );
    error.statusCode = 400;
    throw error;
  }

  const productIds = cart.items.map((item) => item.productId);

  const order = await prisma.$transaction(async (tx) => {
    const lockedProducts = await tx.$queryRaw`
      SELECT id, name, price, stock
      FROM products
      WHERE id IN (${Prisma.join(productIds)})
      FOR UPDATE
    `;

    const productMap = new Map();
    for (const product of lockedProducts) {
      productMap.set(product.id, product);
    }

    let totalAmount = 0;
    const orderItemsData = [];

    for (const cartItem of cart.items) {
      const product = productMap.get(cartItem.productId);

      if (!product) {
        const error = new Error(
          `Product "${cartItem.product?.name || cartItem.productId}" is no longer available`
        );
        error.statusCode = 400;
        throw error;
      }

      if (product.stock < cartItem.quantity) {
        const error = new Error(
          `Insufficient stock for "${product.name}". Available: ${product.stock}, Requested: ${cartItem.quantity}`
        );
        error.statusCode = 400;
        throw error;
      }

      const unitPrice = Number(product.price);
      totalAmount += unitPrice * cartItem.quantity;

      orderItemsData.push({
        productId: cartItem.productId,
        quantity: cartItem.quantity,
        unitPrice,
      });
    }

    totalAmount = Number(totalAmount.toFixed(2));

    const createdOrder = await tx.order.create({
      data: {
        userId,
        totalAmount,
        status: "PENDING",
        items: {
          create: orderItemsData,
        },
      },
      include: {
        items: {
          include: { product: true },
        },
      },
    });

    for (const item of orderItemsData) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
    }

    await tx.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    return createdOrder;
  });
  await deleteByPrefix("products:");
  return formatOrderResponse(order);
};


const formatOrderResponse = (order) => {
  return {
    id: order.id,
    userId: order.userId,
    status: order.status,
    totalAmount: Number(order.totalAmount),
    items: order.items.map((item) => ({
      id: item.id,
      productId: item.productId,
      quantity: item.quantity,
      unitPrice: Number(item.unitPrice),
      subtotal: Number((Number(item.unitPrice) * item.quantity).toFixed(2)),
      product: {
        id: item.product.id,
        name: item.product.name,
        description: item.product.description,
        imageUrl: item.product.imageUrl,
      },
    })),
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
  };
};
