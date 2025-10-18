import { MikroORM } from "@mikro-orm/core";
import { MySqlDriver } from "@mikro-orm/mysql";
import config from "./mikro-orm.config.js";

let orm: MikroORM<MySqlDriver>;


export async function initORM() {
  if (!orm) {
    orm = await MikroORM.init<MySqlDriver>(config);
    const diff = await orm.getSchemaGenerator().getUpdateSchemaSQL();
    if(diff){
      await orm.getSchemaGenerator().createSchema();
      await orm.getMigrator().up();
    }
    console.log("MikroORM initialized!");
  }
  return orm;
}

export function getORM() {
  if (!orm) {
    throw new Error("MikroORM not initialized. Call initORM() first.");
  }
  return orm;
}
