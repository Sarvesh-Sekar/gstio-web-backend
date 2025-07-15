import { UserService } from "./user.service";
import { Request, Response } from "express";
import { postUserValidation } from "./user.validator";
import { AuthHelper } from "../../helpers/auth.helpers";

export class UserController {
  constructor(private userService: UserService) {}
  signup = async (req: Request, res: Response) => {
    try {
      const userData = req.body;
      const userValidation = postUserValidation.safeParse(userData);
      if (!userValidation.success) {
        return res
          .status(406)
          .json({ message: userValidation.error.flatten() });
      }
      userData.password = await AuthHelper.encryptText(userData.password);
      const userExists = await this.userService.findUser(userData.email);
      if (!userExists) {
        return;
      }
      const result = await this.userService.postUser(userData);

      return res.status(201).json(userData);
    } catch (err: any) {
      if (err?.includes(" already exists"))
        return res.status(406).json({ message: err });
    }

    return res.status(500).json({ message: "Internal Server Error" });
  };
}
