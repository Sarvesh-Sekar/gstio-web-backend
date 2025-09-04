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

  static async compareText(text: string, hashedText: string) {
    return await bcrypt.compare(text, hashedText);
  }

  static async generateJwt(payload: JWTPayload) {
    const { JWT_SECRET_KEY } = process.env as any;
    const token = jwt.sign(payload, JWT_SECRET_KEY, {
      expiresIn: "1d",
    });
    return token;
  }

  static async verifyJwt(token: string) {
    try {
      const { JWT_SECRET_KEY } = process.env as any;
      const decoded: any = await jwt.verify(token, JWT_SECRET_KEY);
      return decoded;
    } catch (err) {
      console.error("JWT verification failed:", err);
      throw err; // rethrow so caller can handle
    }
  }
}
