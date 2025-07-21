const redisClient = require("../config/redisClient");

export class RedisService {
  setValue = async (key: string, value: any, expireTime: number) => {
    return await redisClient.setEx(key, expireTime, value);
  };

  getValue = async (key: string) => {
    return await redisClient.get(key);
  };

  deleteKey = async (key: string) => {
    return await redisClient.del(key);
  };
}
