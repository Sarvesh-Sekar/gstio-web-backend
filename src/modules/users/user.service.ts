import { AppDataSource } from "../../dataSource/dataSource";
import { typePostUser } from "./user.types";
import { User } from "../../entity/User";
import { QueryFailedError } from "typeorm";
import { createClient } from "redis";

export class UserService {
  findUser = async (email: string) => {
    try {
      const userRepo = AppDataSource.getRepository(User);
      const user = await userRepo.findOne({ where: { email: email } });
      return user;
    } catch (err) {
      return err;
    }
  };
  postUser = async (data: typePostUser) => {
    try {
      const userRepo = AppDataSource.getRepository(User);
      const user = new User();
      user.email = data.email;
      user.password = data.password;

      const res = await userRepo.save(user);
      return res;
    } catch (err: any) {
      // Handle unique constraint violation
      if (err instanceof QueryFailedError) {
        // For Postgres
        if ((err as any).code === "23505") {
          throw "User already exists";
        }
      }

      // Unknown error
      throw new Error("Failed to create user: " + err.message);
    }
  };
}
