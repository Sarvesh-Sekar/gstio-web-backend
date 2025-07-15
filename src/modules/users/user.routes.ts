import { Router } from "express";
import { UserModule } from "./user.module";

const router = Router();

router.post("/signup", UserModule.controller.signup);

export default router;
