import { Router } from "express";
import { UserModule } from "./user.module";

const router = Router();

router.post("/signup", UserModule.controller.signup);
router.post("/send-otp", UserModule.controller.sendMail);
router.post("/verify-otp", UserModule.controller.verifyOtp);

export default router;
