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

      const hashedPassword = await AuthHelper.encryptText(userData.password);

      const postUserData = {
        email: userData.email,
        password: hashedPassword,
        verified: false,
      };
      const user = await this.userService.postUser(postUserData);

      const responseData = {
        userId: user?.id,
        email: user?.email,
        verified: false,
        details: false,
      };

      console.log(responseData);
      return res.status(201).json({
        status: "registered",
        message: "User Registered Successfully",
        user: responseData,
      });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  };

  generateOtp = async (userId: string) => {
    const otp = Math.floor(1000 + Math.random() * 9000);
    return otp;
  };

  sendMail = async (req: Request, res: Response) => {
    try {
      const userData = req.body;

      const generatedOtp = await this.generateOtp(userData?.userId);
      const key = userData?.userId;
      const value = JSON.stringify(generatedOtp);

      const user = await this.userService.findUser(userData?.userId);

      const mailOptions = {
        from: process.env.EMAIL,
        to: user.email,
        subject: "OTP Verification",
        text: `Your OTP is ${generatedOtp}`,
      };

      await this.redisService.setValue(key, value, 300);
      await transporter.sendMail(mailOptions);
      return res.status(200).json({ message: "OTP sent successfully" });
    } catch (error) {
      return res.status(500).json({ message: "Internal Server Error" });
    }
  };

  verifyOtp = async (req: Request, res: Response) => {
    try {
      const { otp, userId } = req.body;

      const key = userId;
      const value = await this.redisService.getValue(key);

      const cachedValue = JSON.parse(value);

      const user = await this.userService.findUser(userId);
      if (!user) {
        return res.status(401).json({ message: "User Does Not Exist" });
      }

      if (Number(cachedValue) !== Number(otp)) {
        return res.status(401).json({ message: "Invalid OTP" });
      }

      user.verified = true;
      await this.userService.updateUser(user);

      await this.redisService.deleteKey(key);

     const token =  await this.userService.generateJWTToken(
        user.email,
        user.name
      );
      return res.status(200).json({
        message: "User Verified Successfully",
        token:token

      });
    } catch (error) {}
  };

  completeSignUp = async (req: Request, res: Response) => {
    try {
      const { email, userName, userId, companyName, gstId, role } = req.body;

      const user = await this.userService.findUser(userId);
      if (!user)
        return res.status(406).json({ message: "User Does Not Exist" });

      user.userName = userName;
      user.companyName = companyName;
      user.gstId = gstId;
      user.role = role;
      user.verfied = false;

      await this.userService.updateUser(user);
      return res.status(200).json({ message: "Username Updated Successfully" });
    } catch (err) {
      return res.status(500).json({ message: "Internal Server Error" });
    }
  };

  googleSignIn = async (req: Request, res: Response) => {
    const { code } = req.body;

    const tokenData = await this.userService.getAccessToken(code);

    const { access_token, refreshToken } = tokenData;

    const userInfo = await this.userService.getUserInfoFromGoogle(access_token);

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
