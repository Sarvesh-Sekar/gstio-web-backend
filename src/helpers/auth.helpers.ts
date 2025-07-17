import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

type JWTPayload = {
  email: string;
  name: string;
  googleId?: string;
};
export class AuthHelper {
  static async encryptText(text: string): Promise<string> {
    const saltRounds = 10;
    const hashedText = await bcrypt.hash(text, saltRounds);
    return hashedText;
  }

  static async generateJwt(payload: JWTPayload) {
    const { JWT_SECRET_KEY } = process.env;
    const token = jwt.sign(payload, JWT_SECRET_KEY, {
      expiresIn: "1d",
    });
    return token;
  }
}
