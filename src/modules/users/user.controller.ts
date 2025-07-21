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
      const hashedPassword = await AuthHelper.encryptText(userData.password);
      const value = JSON.stringify({
        password: hashedPassword,
        otp: 0,
      });

      await this.redisService.setValue(key, value, 300);

      return res.status(201).json({
        status: "registered",
        message: "User Registered Successfully",
      });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  };

  generateOtp = async (email: string, password: string) => {
    const otp = Math.floor(1000 + Math.random() * 9000);
    const key = email;
    const oldValue = await this.redisService.getValue(key);
    

    const parsedOldValue = JSON.parse(oldValue);
    const value = JSON.stringify({
      password:parsedOldValue.password,
      otp: otp,
    });

    await this.redisService.setValue(key, value, 300);

    return otp;
  };

  sendMail = async (req: Request, res: Response) => {
    try {
      const userData = req.body;

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

      const cachedValue = JSON.parse(value);
      if (cachedValue.otp !== otp) {
        return res.status(401).json({ message: "Invalid OTP" });
      }

      await this.userService.postUser({
        email: email,
        password: cachedValue.password,
      });

      await this.redisService.deleteKey(key);

      return res.status(200).json({
        message: "OTP Verified and User created successfully",
      });
    } catch (error) {}
  };

  completeSignUp = async (req: Request, res: Response) => {
    try {
      const { email, username } = req.body;

      const user = await this.userService.findUser(email);
      if (!user)
        return res.status(406).json({ message: "User Does Not Exist" });
      console.log(user);

      user.username = username;
      await this.userService.updateUser(user);
      return res.status(200).json({ message: "Username Updated Successfully" });
    } catch (err) {
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
