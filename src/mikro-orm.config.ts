import { Options } from "@mikro-orm/core";
import { MySqlDriver } from "@mikro-orm/mysql";
import "dotenv/config";
import { Post } from "./entities/Post.js";
import { User } from "./entities/User.js";
import { Vote } from "./entities/Vote.js";
import { Comment } from "./entities/Comment.js";
import { envConfig } from "./config.env.js";

const config: Options<MySqlDriver> = {
  driver: MySqlDriver,
  dbName: envConfig.DB_NAME || "redditclone",
  user: envConfig.DB_USER || "root",
  password: envConfig.DB_PASS || "",
  host: envConfig.DB_HOST || "localhost",
  port: Number(envConfig.DB_PORT) || 3306,
  entities: [Post, User, Comment, Vote],
  debug: envConfig.NODE_ENV === "development",
  migrations: {
    path: "./src/migrations", // folder for migrations
    pathTs: "./src/migrations", // TS version
    glob: "!(*.test).ts", // which files to consider
    tableName: "mikro_orm_migrations",
  },
};

export default config;
