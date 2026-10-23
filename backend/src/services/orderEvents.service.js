import { randomUUID } from "crypto";
import { getChannel, EXCHANGE, ROUTING_KEYS } from "../config/rabbitmq.js";

export const publishOrderCreated = async (order) => {
  const channel = await getChannel();

  const payload = {
    eventVersion: 1,
    orderId: order.id,
    userId: order.userId,
    totalAmount: Number(order.totalAmount),
    items: order.items.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
      unitPrice: Number(item.unitPrice),
    })),
    createdAt: order.createdAt,
  };

  const content = Buffer.from(JSON.stringify(payload));

  await new Promise((resolve, reject) => {
    channel.publish(
      EXCHANGE,
      ROUTING_KEYS.ORDER_CREATED,
      content,
      {
        persistent: true,            // message stays even if the broker restarts 
        contentType: "application/json",
        messageId: randomUUID(),
        type: ROUTING_KEYS.ORDER_CREATED,
        timestamp: Date.now(),
      },
      (err) => (err ? reject(err) : resolve()) // broker confirm
    );
  });
};