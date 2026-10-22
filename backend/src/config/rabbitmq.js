import amqp from "amqplib";

export const EXCHANGE = "orders.exchange";
export const DLX = "orders.dlx";

export const ROUTING_KEYS = {
  ORDER_CREATED: "order.created",
  ORDER_FAILED: "order.failed",
};

export const QUEUES = {
  ORDER_PROCESSING: "order.processing.queue",
  ORDER_DLQ: "order.processing.dlq",
};

let connection = null;
let channel = null;
let connectingPromise = null;
let reconnectTimer = null;
let reconnectAttempts = 0;

const setupTopology = async (ch) => {
  // Dead-letter exchange and queue
  await ch.assertExchange(DLX, "direct", { durable: true });
  await ch.assertQueue(QUEUES.ORDER_DLQ, { durable: true });

  await ch.bindQueue(QUEUES.ORDER_DLQ, DLX, ROUTING_KEYS.ORDER_FAILED);

  // Main exchange and queue
  await ch.assertExchange(EXCHANGE, "topic", {
    durable: true,
  });

  await ch.assertQueue(QUEUES.ORDER_PROCESSING, {
    durable: true,
    arguments: {
      "x-dead-letter-exchange": DLX,
      "x-dead-letter-routing-key": ROUTING_KEYS.ORDER_FAILED,
    },
  });

  await ch.bindQueue(
    QUEUES.ORDER_PROCESSING,
    EXCHANGE,
    ROUTING_KEYS.ORDER_CREATED,
  );
};

export const scheduleReconnect = () => {
  if (reconnectTimer) return;

  const delay = Math.min(1000 * 2 ** reconnectAttempts, 30000);

  reconnectAttempts++;

  console.log(`RabbitMQ reconnecting in ${delay / 1000}s...`);

  reconnectTimer = setTimeout(async () => {
    reconnectTimer = null;

    try {
      await connectRabbitMQ();
    } catch (err) {
      console.error("RabbitMQ reconnect failed:", err.message);

      scheduleReconnect();
    }
  }, delay);
};

export const connectRabbitMQ = async () => {
  if (channel) return channel;
  if (connectingPromise) return connectingPromise;

  connectingPromise = (async () => {
    let conn;

    try {
      conn = await amqp.connect(
        process.env.RABBITMQ_URL || "amqp://guest:guest@localhost:5672",
      );

      connection = conn;

      conn.on("error", (err) => {
        console.error("RabbitMQ connection error:", err.message);
      });

      conn.on("close", () => {
        console.error("RabbitMQ connection closed");

        if (connection === conn) {
          connection = null;
          channel = null;
          scheduleReconnect();
        }
      });

      const ch = await conn.createConfirmChannel();

      ch.on("error", (err) => {
        console.error("RabbitMQ channel error:", err.message);
      });

      ch.on("close", () => {
        console.error("RabbitMQ channel closed");

        if (connection === conn) {
          channel = null;
          channel = null;
          conn.close().catch(() => {});
          scheduleReconnect();
        }
      });

      await setupTopology(ch);

      if (connection !== conn) {
        throw new Error("RabbitMQ connection closed during setup");
      }

      channel = ch;
      reconnectAttempts = 0;

      console.log("RabbitMQ connected & topology ready");

      return ch;
    } catch (err) {
      if (connection === conn) {
        connection = null;
        channel = null;
      }

      if (conn) {
        try {
          await conn.close();
        } catch {
        }
      }

      scheduleReconnect();
      throw err;
    } finally {
      connectingPromise = null;
    }
  })();

  return connectingPromise;
};

export const getChannel = async () => {
  if (channel) return channel;

  return connectRabbitMQ();
};
