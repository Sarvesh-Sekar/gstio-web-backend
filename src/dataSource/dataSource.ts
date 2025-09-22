import dotenv from "dotenv";
dotenv.config();
import { DataSource } from "typeorm";

const { DB_HOST, DB_USERNAME, DB_PASSWORD, DB_NAME, NODE_ENV } = process.env;

const isProd = NODE_ENV === "prod";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: DB_HOST,
  port: 5432,
  username: DB_USERNAME,
  password: DB_PASSWORD,
  database: DB_NAME,
  synchronize: true,
  logging: true,
  entities: [isProd ? "dist/entity/**/*.js" : "src/entity/**/*.ts"],
  migrations: [
    isProd ? "dist/migration/**/*.js" : "src/migration/**/*.ts",
  ],
  subscribers: [
    isProd ? "dist/subscribers/**/*.js" : "src/subscriber/**/*.ts",
  ],
});
