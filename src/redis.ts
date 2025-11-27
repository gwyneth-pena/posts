import { createClient } from "redis";
import { RedisStore } from "connect-redis";
import { envConfig } from "./config.env.js";

export const redisClient = createClient({ url: envConfig.DB_REDIS_URL });
redisClient.on("error", (err) => console.error("Redis error:", err));

export let redisStore: RedisStore;

export async function getRedisStore() {
  if (!redisStore) {
    redisStore = new RedisStore({ client: redisClient, prefix: "sess:" });
  }
  if (!redisClient.isOpen) await redisClient.connect();
  return redisStore;
}
