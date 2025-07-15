import { z } from "zod";

export const postUserValidation = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .regex(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/),

  password: z
    .string()
    .min(1, "Password is required") // Ensures not empty
    .min(8, "Password must be at least 8 characters long")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),
});
