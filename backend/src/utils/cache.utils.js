import redis from '../config/redis.js';

export const getCache = async (key) => {
  try {
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export const setCache = async (key, value, ttlSeconds = 60) => {
  try {
    await redis.set(key, JSON.stringify(value), 'EX', ttlSeconds);
  } catch(err) { 
    console.log("Redis err:",err);
  }
}

export const deleteCache = async (...keys) => {
  try {
    if (keys.length) await redis.del(...keys);
  } catch { }
}

export const deleteByPrefix = async (prefix) => {
  try {
    const stream = redis.scanStream({ match: `${prefix}*`, count: 100 });
    for await (const keys of stream) {
      if (keys.length) await redis.del(...keys);
    }
  } catch { }
}