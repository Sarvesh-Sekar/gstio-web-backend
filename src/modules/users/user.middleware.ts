import express from "express";
import { Request, Response, NextFunction } from "express";
import { AuthHelper } from "../../helpers/auth.helpers";
import { UserService } from "./user.service";
import { typeUser } from "./user.types";

export class UserMiddleware {
  constructor(private userService: UserService) {}
  verifyUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req.header("Authorization");
      if (!token) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      
      const decoded: typeUser = await AuthHelper.verifyJwt(token);
      
      if (!decoded) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const user = await this.userService.findUser(decoded.email);
      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      req.body.userId = decoded?.userId;
      next();

      //   if (!!decoded) return res.status(401).json({ message: "Unauthorized" });
    } catch (err) {
      throw err;
    }
  };
}
