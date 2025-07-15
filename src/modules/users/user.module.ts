import { UserController } from "./user.controller";
import { UserService } from "./user.service";
import { RedisService } from "../../services/RedisService";

export const UserModule = {
  controller: new UserController(new UserService(), new RedisService()),
};
