import session from "express-session";
import { createClient } from "redis";

const redisClient = createClient({ url: process.env.DB_REDIS_URL });
redisClient.on("error", console.error);
await redisClient.connect();

class RedisStoreManual extends session.Store {
  prefix = "sess:";

  async get(sid: string, callback: (err: any, session?: any) => void) {
    try {
      const data: any = await redisClient.get(this.prefix + sid);
      callback(null, data ? JSON.parse(data) : null);
    } catch (err) {
      callback(err);
    }
  }

  async set(sid: string, sess: any, callback?: (err?: any) => void) {
    try {
      await redisClient.set(this.prefix + sid, JSON.stringify(sess), {
        EX: sess.cookie?.maxAge ? Math.floor(sess.cookie.maxAge / 1000) : 7200,
      });
      callback?.();
    } catch (err) {
      callback?.(err);
    }
  }

  async destroy(sid: string, callback?: (err?: any) => void) {
    try {
      await redisClient.del(this.prefix + sid);
      callback?.();
    } catch (err) {
      callback?.(err);
    }
  }
}

export const redisStore = new RedisStoreManual();
