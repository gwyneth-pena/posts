import { Options } from '@mikro-orm/core';
import { MySqlDriver } from '@mikro-orm/mysql';
import 'dotenv/config';

const config: Options<MySqlDriver> = {
  driver: MySqlDriver,
  dbName: process.env.DB_NAME || 'redditclone',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  entities: ['/dist/entities/*.js'],
  entitiesTs: ['/src/entities/*.ts'], 
  debug: process.env.NODE_ENV === 'development',
  migrations: {
    path: './src/migrations',        // folder for migrations
    pathTs: './src/migrations',      // TS version
    glob: '!(*.test).ts',            // which files to consider
    tableName: 'mikro_orm_migrations',
  },
};

export default config;
