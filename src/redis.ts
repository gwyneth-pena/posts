import session from "express-session";
import { createClient } from "redis";

let redisClient: ReturnType<typeof createClient> | null = null;
let redisStore: session.Store | null = null;

export async function getRedisClient() {
  if (!redisClient) {
    redisClient = createClient({ url: process.env.DB_REDIS_URL });
    redisClient.on("error", console.error);
    await redisClient.connect();
    console.log("Redis connected");
  }
  return redisClient;
}

export async function getRedisStore(): Promise<session.Store> {
  if (!redisStore) {
    const client = await getRedisClient();
    redisStore = new (class extends session.Store {
      prefix = "sess:";

      async get(sid: string, cb: (err: any, sess?: any) => void) {
        try {
          const data: any = await client.get(this.prefix + sid);
          cb(null, data ? JSON.parse(data) : null);
        } catch (err) {
          cb(err);
        }
      }

      async set(sid: string, sess: any, cb?: (err?: any) => void) {
        try {
          await client.set(this.prefix + sid, JSON.stringify(sess), {
            EX: sess.cookie?.maxAge
              ? Math.floor(sess.cookie.maxAge / 1000)
              : 7200,
          });
          cb?.();
        } catch (err) {
          cb?.(err);
        }
      }

      async destroy(sid: string, cb?: (err?: any) => void) {
        try {
          await client.del(this.prefix + sid);
          cb?.();
        } catch (err) {
          cb?.(err);
        }
      }
    })();
  }

  return redisStore;
}
