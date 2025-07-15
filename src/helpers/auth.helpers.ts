import bcrypt from "bcrypt";

export class AuthHelper {
  static async encryptText(text: string): Promise<string> {
    const saltRounds = 10;
    const hashedText = await bcrypt.hash(text, saltRounds);
    return hashedText;
  }
}
