import { createClient } from "redis";

let redisClient;

export async function getRedisClient() {
  if (!redisClient) {
    redisClient = createClient({
      url: process.env.DB_REDIS_URL,
    });

    redisClient.on("error", (err) => console.error("❌ Redis error:", err));

    await redisClient.connect();
    console.log("✅ Redis connected");
  }

  return redisClient;
}
