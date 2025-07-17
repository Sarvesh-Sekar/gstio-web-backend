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
      if (userExists)
        return res.status(406).json({ message: "User Already Exists" });

      const key = userData.email;
      const value = JSON.stringify({
        password: userData.password,
        otp: 0,
      });
      await this.redisService.setValue(key, value, 360);

      return res.status(201).json(userData);
    } catch (err) {
      return res.status(500).json({ message: "Internal Server Error" });
    }
  };

  generateOtp = async (email: string, password: string) => {
    password = await AuthHelper.encryptText(password);
    const otp = Math.floor(1000 + Math.random() * 9000);
    const key = email;
    const value = JSON.stringify({ password, otp });
    await this.redisService.setValue(key, value, 60);

    return otp;
  };

  sendMail = async (req: Request, res: Response) => {
    try {
      const userData = req.body;
      const userValidation = postUserValidation.safeParse(userData);
      if (!userValidation.success) {
        return res
          .status(406)
          .json({ message: userValidation.error.flatten() });
      }

      const generatedOtp = await this.generateOtp(
        userData?.email,
        userData?.password
      );
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
      const parsedValue = JSON.parse(value);

      if (parsedValue.otp === Number(otp)) {
        await this.userService.postUser({
          email: email,
          password: parsedValue.password,
        });
      }

      await this.redisService.deletKey(key);

      return res.send({
        message: "OTP Verified and User created successfully",
      });
    } catch (error) {}
  };

  signIn = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const userExists = await this.userService.findUser(email);
    if (!userExists)
      return res.status(406).json({ message: "User Does Not Exist" });

    
  };

  googleSign = async (req: Request, res: Response) => {
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
}
