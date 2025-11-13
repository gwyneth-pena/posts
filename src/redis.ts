import { createClient } from "redis";
import { RedisStore } from "connect-redis";

let redisClient: ReturnType<typeof createClient>;
let redisStore: RedisStore;

export async function getRedisClient() {
  if (redisClient && redisClient.isOpen) return redisClient;

  redisClient = createClient({
    url: process.env.DB_REDIS_URL,
    socket: { tls: true, rejectUnauthorized: false },
  });

  redisClient.on("error", (err) => console.error("Redis error:", err));

  await redisClient.connect();
  console.log("Redis connected");

  return redisClient;
}

export async function getRedisStore() {
  if (!redisStore) {
    const client = await getRedisClient();
    redisStore = new RedisStore({ client });
  }
  return redisStore;
}
