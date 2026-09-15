const { Redis } = require('@upstash/redis');

const redis = Redis.fromEnv();

async function saveOrder(id, data) {
  try {
    await redis.set(`order:${id}`, JSON.stringify(data), { ex: 604800 });
    console.log('Saved order to Redis:', id);
  } catch (error) {
    console.error('Redis save error:', error);
    throw error;
  }
}

async function getOrder(id) {
  try {
    const data = await redis.get(`order:${id}`);
    if (!data) return null;
    return typeof data === 'string' ? JSON.parse(data) : data;
  } catch (error) {
    console.error('Redis get error:', error);
    return null;
  }
}

module.exports = { saveOrder, getOrder };