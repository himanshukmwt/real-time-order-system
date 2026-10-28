import "dotenv/config";
import prisma from "../lib/prisma.js";
import {
  connectRabbitMQ,
  onRabbitReady,
  QUEUES,
} from "../config/rabbitmq.js";
import { deleteByPrefix } from "../utils/cache.utils.js";
import { setOrderStatusCache } from "../utils/orderStatus.utils.js";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Dummy payment: 80% success
const simulatePayment = async () => {
  await sleep(2000);
  return Math.random() > 0.2;
};

const transition = async (order, from, to) => {
  const result = await prisma.order.updateMany({
    where: { id: order.id, status: from },
    data: { status: to },
  });

  if (result.count !== 1) return false; // status updated by other (cancel, duplicate message)

  await setOrderStatusCache(order.id, order.userId, to);
  console.log(`Order ${order.id}: ${to}`);
  return true;
};

const handlePaymentFailure = async (order) => {
  const failed = await prisma.$transaction(async (tx) => {
    const updated = await tx.order.updateMany({
      where: { id: order.id, status: "PENDING" },
      data: { status: "FAILED" },
    });

    if (updated.count !== 1) return false;

    // Stock wapas, sorted order mein (deadlock se bachne ke liye)
    const sortedItems = [...order.items].sort((a, b) =>
      a.productId.localeCompare(b.productId)
    );
    for (const item of sortedItems) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { increment: item.quantity } },
      });
    }

    return true;
  });

  if (failed) {
    await setOrderStatusCache(order.id, order.userId, "FAILED");
    await deleteByPrefix("products:"); // stock badla, product cache purana
    console.log(`Order ${order.id}: payment FAILED, stock restored`);
  }
};

const processOrder = async (orderId) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });

  if (!order) {
    console.warn(`Order ${orderId} not found, skipping`);
    return;
  }

  // Idempotency: duplicate message aaye to dobara process nahi hoga
  if (order.status !== "PENDING") {
    console.log(`Order ${orderId} already ${order.status}, skipping`);
    return;
  }

  const paid = await simulatePayment();

  if (!paid) {
    await handlePaymentFailure(order);
    return;
  }

  if (!(await transition(order, "PENDING", "PAYMENT_CONFIRMED"))) return;

  await sleep(3000);
  if (!(await transition(order, "PAYMENT_CONFIRMED", "PREPARING"))) return;

  await sleep(3000);
  if (!(await transition(order, "PREPARING", "OUT_FOR_DELIVERY"))) return;

  await sleep(3000);
  await transition(order, "OUT_FOR_DELIVERY", "DELIVERED");
};

const startConsumer = async (ch) => {
  await ch.prefetch(1); // single message at a time

  await ch.consume(QUEUES.ORDER_PROCESSING, async (msg) => {
    if (!msg) return;

    try {
      const payload = JSON.parse(msg.content.toString());
      await processOrder(payload.orderId);
      ch.ack(msg);
    } catch (err) {
      console.error("Order processing failed:", err.message);
      ch.nack(msg, false, false); // requeue nahi, put into DLQ 
    }
  });

  console.log(`Worker listening on ${QUEUES.ORDER_PROCESSING}`);
};

onRabbitReady(startConsumer);

connectRabbitMQ().catch((err) =>
  console.error("Worker RabbitMQ connect failed:", err.message)
);