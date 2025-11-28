import { ApolloServer } from "apollo-server-express";
import express from "express";
import { typeDefs } from "./graphql/schema.js";
import { resolvers } from "./graphql/resolvers/resolvers.js";
import { connectToMongo, initORM } from "./db.js";
import { TrimStringsPlugin } from "./graphql/plugins/trimStrings.js";
import session from "express-session";
import cors from "cors";
import { envConfig } from "./config.env.js";
import { getRedisStore, getRedisClient } from "./redis.js";
import cookie from "cookie";

export async function createServer() {
  await connectToMongo();

  const orm = await initORM();

  const app = express();

  const allowedOrigins = [
    envConfig.FRONTEND_URL,
    "https://studio.apollographql.com",
  ];

  app.use(
    cors({
      origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) return callback(null, true);
        callback(new Error("CORS not allowed"));
      },
      credentials: true,
    })
  );

  const isProd = envConfig.NODE_ENV?.toLowerCase()?.includes("prod");
  const store = await getRedisStore();
  const redisClient = await getRedisClient();

  if (isProd) {
    app.set("trust proxy", 1);
  }

  app.use(
    session({
      name: "session_id",
      store: store,
      secret: envConfig.SECRET_KEY,
      resave: false,
      saveUninitialized: false,
      cookie: {
        path: "/",
        httpOnly: true,
        maxAge:
          Number(envConfig.SESSION_EXPIRY_TIME || 0) || 1000 * 60 * 60 * 2,
        secure: isProd,
        signed: false,
        sameSite: isProd ? "none" : "lax",
      },
    })
  );

  app.post("/logout", async (req: any, res: any) => {
    const userId = req.session.userId;
    console.log("Logging out user", userId);
    if (!userId) return res.json({ success: true });

    const sessionId = await redisClient.get(`user_sessions:${userId}`);
    if (!sessionId) return res.json({ success: true });
    await redisClient.del(`sess:${sessionId}`);
    await redisClient.del(`user_sessions:${userId}`);

    res.clearCookie("session_id", {
      path: "/",
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
    });
    return res.json({ success: true });
  });

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req, res }) => ({
      em: orm.em.fork(),
      req,
      res,
    }),
    plugins: [TrimStringsPlugin],
  });
  await server.start();

  server.applyMiddleware({ app, path: "/graphql", cors: false });

  return app;
}
