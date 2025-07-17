import { AppDataSource } from "../../dataSource/dataSource";
import { typePostUser } from "./user.types";
import { User } from "../../entity/User";
import { QueryFailedError } from "typeorm";
import axios from "axios";
import dotenv from "dotenv";
import { TOKEN_URI, USER_INFO_URI } from "../../urls";
import { AuthHelper } from "../../helpers/auth.helpers";
dotenv.config();
export class UserService {
  constructor() {}
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

  getAccessToken = async (code: string) => {
    try {
      const payload = {
        code: code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: "postmessage",
        grant_type: "authorization_code",
      };

      const response = await axios.post(TOKEN_URI, null, {
        params: { payload },
      });

      return response?.data;
    } catch (err) {
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

  generateJWTToken = async (email: string, name: string, id: string) => {
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
