import dotenv from "dotenv";
dotenv.config();
import { DataSource } from "typeorm";

const { DB_HOST, DB_USERNAME, DB_PASSWORD, DB_NAME } = process.env;

export const AppDataSource = new DataSource({
  type: "postgres",
  host: DB_HOST,
  port: 5432,
  username: DB_USERNAME,
  password: DB_PASSWORD,
  database: DB_NAME,
  synchronize: false,
  logging: true,
  entities: ["src/entity/**/*.ts"],
  migrations: ["/migration/**/*.ts"],
  subscribers: ["src/subscriber/**/*.ts"],
});
