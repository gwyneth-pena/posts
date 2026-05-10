import config from "./mikro-orm.config.js";
import "dotenv/config";
import mongoose from "mongoose";
import { envConfig } from "./config.env.js";
import { PostgreSqlDriver } from "@mikro-orm/postgresql";
import { MikroORM } from "@mikro-orm/core";

let orm: MikroORM;

export async function initORM() {
  if (!orm) {
    orm = await MikroORM.init<PostgreSqlDriver>(config);
    
    const generator = orm.schema;
    const diff = await generator.getUpdateSchemaSQL();
    
    if (diff) {
      await generator.updateSchema();
      await orm.migrator.up();
    }
  }
  return orm;
}

export function getORM() {
  if (!orm) {
    throw new Error("MikroORM not initialized. Call initORM() first.");
  }
  return orm;
}

export async function connectToMongo() {
  try {
    await mongoose.connect(envConfig.MONGO_URI);
    console.log("MongoDB connected");
  } catch (err) {
    throw new Error("MongoDB connection failed");
  }
}
