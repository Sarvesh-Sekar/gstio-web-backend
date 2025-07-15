import { UserController } from './user.controller';
import { UserService } from './user.service';

export const UserModule = {
  controller: new UserController(new UserService())
};
