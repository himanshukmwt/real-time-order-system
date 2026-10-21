import Redis from 'ioredis';

const redis=new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: 2,});

redis.on('connect', () => console.log('Redis connected'));
redis.on('error', (err) => console.log('Redis error:', err.message));

export default redis;