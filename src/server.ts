import { ApolloServer } from "apollo-server-express";
import express from "express";
import { typeDefs } from "./graphql/schema.js";
import { resolvers } from "./graphql/resolvers/resolvers.js";
import { connectToMongo, initORM } from "./db.js";
import { TrimStringsPlugin } from "./graphql/plugins/trimStrings.js";
import session from "express-session";
import { RedisStore } from "connect-redis";
import { getRedisClient } from "./redis.js";
import cors from "cors";

export async function createServer() {
  await connectToMongo();

  const orm = await initORM();

  const app = express();

  const redisClient = await getRedisClient();

  const allowedOrigins = [
    process.env.FRONTEND_URL,
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

  const isProd = process.env.NODE_ENV?.toLowerCase()?.includes("prod");

  if (isProd) {
    app.set("trust proxy", 1);
  }

  app.use(
    session({
      name: "session_id",
      store: new RedisStore({ client: redisClient }),
      secret: process.env.SECRET_KEY,
      resave: false,
      saveUninitialized: false,
      cookie: {
        path: "/",
        httpOnly: true,
        maxAge:
          Number(process.env.SESSION_EXPIRY_TIME || 0) || 1000 * 60 * 60 * 2,
        secure: isProd,
        sameSite: isProd ? "none" : "lax",
      },
    })
  );

  app.post("/logout", (req: any, res) => {
    const isProd = process.env.NODE_ENV?.toLowerCase()?.includes("prod");

    req.session.destroy((err:any) => {
      if (err) {
        console.error("Session destroy error:", err);
        return res.status(500).json({ success: false });
      }

      res.clearCookie("session_id", {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? "none" : "lax",
        path: "/",
      });

      res.json({ success: true });
    });
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
