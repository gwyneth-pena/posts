import { ApolloServer } from "apollo-server-express";
import express from "express";
import { typeDefs } from "./graphql/schema.js";
import { resolvers } from "./graphql/resolvers/resolvers.js";
import { initORM } from "./db.js";
import { TrimStringsPlugin } from "./graphql/plugins/trimStrings.js";
import session from "express-session";
import { RedisStore } from "connect-redis";
import redisClient from "./redis.js";
import cors from "cors";

export async function createServer() {
  const orm = await initORM();

  const app = express();

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

  app.use(
    session({
      name: "session_id",
      store: new RedisStore({ client: redisClient }),
      secret: process.env.SECRET_KEY,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        maxAge:
          Number(process.env.SESSION_EXPIRY_TIME || 0) || 1000 * 60 * 60 * 2,
        secure: process.env.NODE_ENV?.toLowerCase()?.includes("prod"),
        sameSite: "lax",
      },
    })
  );

  app.post("/logout", async (req: any, res: any) => {
    await req.session.destroy();
    res.clearCookie("session_id", {
      httpOnly: true,
      secure: process.env.NODE_ENV?.toLowerCase()?.includes("prod"),
      sameSite: "lax",
    });
    res.json({ success: true });
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
