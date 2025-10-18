import Redis from "redis";

const redisClient = Redis.createClient({
  url: process.env.DB_REDIS_URL,
});

redisClient.connect().catch(console.error);

export default redisClient;
