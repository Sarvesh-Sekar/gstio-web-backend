import { UserService } from "./user.service";
import { Request, Response } from "express";
import { postUserValidation } from "./user.validator";
import { AuthHelper } from "../../helpers/auth.helpers";
import { RedisService } from "../../services/RedisService";
import { transporter } from "../../config/mailTransporter";

export class UserController {
  constructor(
    private userService: UserService,
    private redisService: RedisService
  ) {}
  submitRegistration = async (req: Request, res: Response) => {
    try {
      const userData = req.body;
      const userValidation = postUserValidation.safeParse(userData);
      if (!userValidation.success) {
        return res
          .status(406)
          .json({ message: userValidation.error.flatten() });
      }

      const userExists = await this.userService.findUser(userData.email);
      if (userExists)
        return res.status(406).json({ message: "User Already Exists" });

      const key = userData.email;
      const value = "0";

      await this.redisService.setValue(key, value, 300);

      return res.status(201).json({ message: "User Registered Successfully" });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  };

  generateOtp = async (email: string) => {
    const value = Math.floor(1000 + Math.random() * 9000);
    const key = email;

    await this.redisService.setValue(key, value.toString(), 300);

    return value;
  };

  sendMail = async (req: Request, res: Response) => {
    try {
      const userData = req.body;

      const generatedOtp = await this.generateOtp(userData?.email);
      const mailOptions = {
        from: process.env.EMAIL,
        to: userData.email,
        subject: "OTP Verification",
        text: `Your OTP is ${generatedOtp}`,
      };

      await transporter.sendMail(mailOptions);
      return res.status(200).json({ message: "OTP sent successfully" });
    } catch (error) {
      return res.status(500).json({ message: "Internal Server Error" });
    }
  };

  verifyOtp = async (req: Request, res: Response) => {
    try {
      const { otp, email } = req.body;

      const key = email;
      const value = await this.redisService.getValue(key);

      if (value !== otp) {
        return res.status(401).json({ message: "Invalid OTP" });
      }

      return res.status(200).json({
        message: "OTP Verified and User created successfully",
      });
    } catch (error) {}
  };

  signup = async (req: Request, res: Response) => {
    try {
      const userData = req.body;
      const userValidation = postUserValidation.safeParse(userData);
      if (!userValidation.success) {
        return res
          .status(406)
          .json({ message: userValidation.error.flatten() });
      }

      const userExists = await this.userService.findUser(userData.email);
      if (userExists)
        return res.status(406).json({ message: "User Already Exists" });

      const cacheData = await this.redisService.getValue(userData.email);
      if (cacheData?.otp)
        return res.status(406).json({ message: "Email Not Verified" });

      userData.password = await AuthHelper.encryptText(userData.password);

      const user = await this.userService.postUser(userData);
      await this.redisService.deleteKey(userData?.email);

      return res.status(200).json({ message: "User Created Successfully" });
    } catch (error) {
      return res.status(500).json({ message: "Internal Server Error" });
    }
  };

  googleSignIn = async (req: Request, res: Response) => {
    const { code } = req.body;

    const tokenData = await this.userService.getAccessToken(code);

    const { accessToken, refreshToken } = tokenData;

    const userInfo = await this.userService.getUserInfoFromGoogle(accessToken);

    const { email, name, sub: googleId } = userInfo;

    const userExists = await this.userService.findUser(email);
    if (!userExists)
      return res.status(406).json({ message: "User Does Not Exist" });

    const token = await this.userService.generateJWTToken(
      email,
      name,
      googleId
    );

    return res.status(200).json({ token });
  };

  manualSignIn = async (req: Request, res: Response) => {
    try {
      const { email, password, username } = req.body;

      const userExists = await this.userService.findUser(email);
      if (!userExists)
        return res.status(406).json({ message: "User Does Not Exist" });

      const isPasswordCorrect = await AuthHelper.compareText(
        password,
        userExists?.password
      );

      if (!isPasswordCorrect)
        return res.status(406).json({ message: "Incorrect Password" });

      const token = await this.userService.generateJWTToken(
        userExists.email,
        userExists.name
      );

      return res.status(200).json({ token });
    } catch (err) {
      return res.status(500).json({ message: "Internal Server Error" });
    }
  };
}
