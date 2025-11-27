import { ApolloServer } from "apollo-server-express";
import express from "express";
import { typeDefs } from "./graphql/schema.js";
import { resolvers } from "./graphql/resolvers/resolvers.js";
import { connectToMongo, initORM } from "./db.js";
import { TrimStringsPlugin } from "./graphql/plugins/trimStrings.js";
import session from "express-session";
import cors from "cors";
import { envConfig } from "./config.env.js";
import cookieParser from "cookie-parser";
import { getRedisStore, redisClient } from "./redis.js";

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

  if (isProd) {
    app.set("trust proxy", 1);
  }

  app.use(
    session({
      name: "session_id",
      store: getRedisStore(),
      secret: envConfig.SECRET_KEY,
      resave: false,
      saveUninitialized: false,
      cookie: {
        path: "/",
        httpOnly: true,
        maxAge:
          Number(envConfig.SESSION_EXPIRY_TIME || 0) || 1000 * 60 * 60 * 2,
        secure: isProd,
      },
    })
  );

  app.post("/logout", async (req: any, res: any) => {
    if (!req.sessionID) return res.json({ success: true });

    try {
      const deleted = await redisClient.del(`sess:${req.sessionID}`);
      console.log("Deleted Redis session:", deleted);

      req.session.destroy((err) => {
        if (err) console.error("Session destroy error:", err);
      });

      res.clearCookie("session_id", {
        path: "/",
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? "none" : "lax",
      });

      return res.json({ success: true });
    } catch (err) {
      console.error("Logout error:", err);
      return res.status(500).json({ success: false });
    }
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
