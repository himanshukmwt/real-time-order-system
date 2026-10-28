import redis from "../config/redis.js";

const STATUS_TTL_SECONDS = 600; // 10 min

export const setOrderStatusCache = async (orderId, userId, status) => {
  try {
    const value = JSON.stringify({
      orderId,
      userId,
      status,
      updatedAt: new Date().toISOString(),
    });

    await redis.set(`order:status:${orderId}`, value, "EX", STATUS_TTL_SECONDS);

    // Pub/Sub: for live status updates ke 
    await redis.publish(`order:updates:${userId}`, value);
  } catch (err) {
    console.error("setOrderStatusCache failed:", err.message);
  }
};

export const getOrderStatusCache = async (orderId) => {
  try {
    const data = await redis.get(`order:status:${orderId}`);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
};