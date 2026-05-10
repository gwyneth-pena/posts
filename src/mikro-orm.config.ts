import { defineConfig } from "@mikro-orm/postgresql"; 
import "dotenv/config";
import { Post } from "./entities/Post.js";
import { User } from "./entities/User.js";
import { Vote } from "./entities/Vote.js";
import { Comment } from "./entities/Comment.js";
import { envConfig } from "./config.env.js";

export default defineConfig({
  dbName: envConfig.DB_NAME || "redditclone",
  user: envConfig.DB_USER || "postgres",
  password: envConfig.DB_PASS || "",
  host: envConfig.DB_HOST || "localhost",
  port: Number(envConfig.DB_PORT) || 5432,
  entities: [Post, User, Comment, Vote],
  debug: envConfig.NODE_ENV === "development",
  driverOptions: {
    connection: { 
      ssl: { rejectUnauthorized: false } 
    },
  },
  schemaGenerator: {
    disableForeignKeys: false,
  },
  migrations: {
    path: "./src/migrations",
    pathTs: "./src/migrations",
    glob: "!(*.test).ts",
    tableName: "mikro_orm_migrations",
  },
});