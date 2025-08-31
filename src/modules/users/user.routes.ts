import { Router } from "express";
import { UserModule } from "./user.module";

const router = Router();

router.post("/register", UserModule.controller.submitRegistration);
router.post("/signup", UserModule.controller.completeSignUp);
router.post("/generate-otp", UserModule.controller.sendMail);
router.post("/verify-otp", UserModule.controller.verifyOtp);
router.post("/auth/google", UserModule.controller.googleSignIn);
router.post("/login", UserModule.controller.manualSignIn);
router.post("/myData", UserModule.controller.userCardData);
router.post("/verify-gst", UserModule.controller.verifyGSTID);

export default router;
