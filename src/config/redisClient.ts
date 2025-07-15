import { createClient } from "redis";
import dotenv from "dotenv";
dotenv.config();

const redisClient = createClient({
  socket: {
    port: Number(process.env.REDIS_PORT),
    host: process.env.REDIS_HOST,
  },
});

redisClient.on("error", (err) => console.log("Redis Client Error", err));

(async () => {
  await redisClient.connect();
})();

module.exports = redisClient;
