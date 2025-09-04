import { UserController } from "./user.controller";
import { UserService } from "./user.service";
import { RedisService } from "../../services/RedisService";
import {UserMiddleware} from "./user.middleware";

export const UserModule = {
  controller: new UserController(new UserService(), new RedisService()),
  middleware: new UserMiddleware(new UserService()),
};
