import { AppDataSource } from "../../dataSource/dataSource";
import { typePostUser } from "./user.types";
import { User } from "../../entity/User";
import { QueryFailedError, createQueryBuilder } from "typeorm";
import axios from "axios";
import dotenv from "dotenv";
import { TOKEN_URI, USER_INFO_URI } from "../../urls";
import { AuthHelper } from "../../helpers/auth.helpers";
dotenv.config();
export class UserService {
  constructor() {}
  findUser = async (email?: string, username?: string): Promise<any> => {
    try {
      const userRepo = AppDataSource.getRepository(User);
      const user = await userRepo
        .createQueryBuilder("user")
        .where("user.email = :email", { email: email })
        .orWhere("user.name = :username", { username: username })
        .getOne();
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
      user.name = data.username;

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

  updateUser = async (data: typePostUser) => {
    try {
      const userRepo = AppDataSource.getRepository(User);
      const user = await userRepo
        .createQueryBuilder("user")
        .where("user.email = :email", { email: data.email })
        .getOne();
      if (!user) {
        throw new Error("User not found");
      }

      user.name = data.username;
      const res = await userRepo.update(
        { email: data.email },
        { name: user.name }
      );
      return res;
    } catch (err) {
      throw err;
    }
  };

  getAccessToken = async (code: string) => {
    try {
      const payload: any = {
        code: code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: "postmessage",
        grant_type: "authorization_code",
      };

      const response = await axios.post(TOKEN_URI, payload, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      return response?.data;
    } catch (err) {
      console.log(err);
      throw err;
    }
  };

  getUserInfoFromGoogle = async (accessToken: string) => {
    try {
      const response = await axios.get(USER_INFO_URI, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return response?.data;
    } catch (err) {
      throw err;
    }
  };

  generateJWTToken = async (email: string, name: string, id?: string) => {
    try {
      const payload = {
        email: email,
        name: name,
        googleId: id,
      };

      const response = await AuthHelper.generateJwt(payload);
      return response;
    } catch (err) {
      throw err;
    }
  };
}
