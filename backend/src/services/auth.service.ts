import { hash, compare } from "bcryptjs";
import jwt from "jsonwebtoken";
import type { z } from "zod";
import { User, UserSchema } from "../models/user.model.js";

export class AuthService {
  static async register(data: z.infer<typeof UserSchema>) {
    const validatedData = UserSchema.parse(data);
    const hashedPassword = await hash(validatedData.password, 10);
    const user = new User({
      email: validatedData.email,
      password: hashedPassword,
      name: validatedData.name,
    });
    await user.save();
    return { message: "Utilisateur créé avec succès" };
  }

  static async login(data: { email: string; password: string }) {
    const user = await User.findOne({ email: data.email });
    if (!user) throw new Error("Utilisateur non trouvé");

    const isPasswordValid = await compare(data.password, user.password);
    if (!isPasswordValid) throw new Error("Mot de passe incorrect");

    const token = jwt.sign(
      { id: user._id, email: user.email, name: user.name },
      process.env.JWT_SECRET!,
      { expiresIn: "1h" }
    );
    return { token };
  }
}
