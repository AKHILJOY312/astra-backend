// import { Request, Response } from "express";
// import User from "../../../frameworks/db/mongoose/modals/User";
// import bcrypt from "bcryptjs";
// import crypto from "crypto";
// import jwt from "jsonwebtoken";
// import {
//   sendVerificationEmail,
//   sendPasswordResetEmail,
// } from "../../../utils/sendEmail";

// const generateAccessToken = (user: any) => {
//   return jwt.sign(
//     { id: user._id, email: user.email },
//     process.env.ACCESS_TOKEN_SECRET!,
//     { expiresIn: "15m" }
//   );
// };

// const generateRefreshToken = (user: any) => {
//   return jwt.sign({ id: user._id }, process.env.REFRESH_TOKEN_SECRET!, {
//     expiresIn: "7d",
//   });
// };

// export const register = async (req: Request, res: Response) => {
//   const { name, email, password, confirmPassword } = req.body;

//   if (!name || !email || !password || !confirmPassword) {
//     return res.status(400).json({ message: "All fields are required" });
//   }

//   if (password !== confirmPassword) {
//     return res.status(400).json({ message: "Passwords do not match" });
//   }

//   try {
//     const existingUser = await User.findOne({ email });
//     if (existingUser) {
//       return res.status(400).json({ message: "User already exists" });
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);
//     const verificationToken = crypto.randomBytes(32).toString("hex");
//     const verificationTokenExpires = Date.now() + 3600000; // 1 hour

//     const user = await User.create({
//       name,
//       email,
//       password: hashedPassword,
//       verificationToken: verificationToken,
//       verificationTokenExpires: verificationTokenExpires,
//     });

//     await sendVerificationEmail(email, verificationToken);

//     res.status(201).json({
//       message:
//         "User registered. Please check your email to verify your account.",
//     });
//   } catch (error) {
//     res.status(500).json({ message: "Server error" });
//   }
// };

// export const verifyEmail = async (req: Request, res: Response) => {
//   const { token } = req.query;
//   try {
//     const user = await User.findOne({
//       verificationToken: token,
//       verificationTokenExpires: { $gt: Date.now() },
//     });
//     if (!user) {
//       return res.status(400).json({ message: "Invalid or expired token" });
//     }

//     user.isVerified = true;
//     user.verificationToken = undefined;
//     user.verificationTokenExpires = undefined;
//     await user.save();

//     res
//       .status(200)
//       .json({ message: "Email verified successfully. You can now log in." });
//   } catch (error) {
//     res.status(500).json({ message: "Server error" });
//   }
// };
// export const login = async (req: Request, res: Response) => {
//   const { email, password } = req.body;

//   if (!email || !password) {
//     return res.status(400).json({ message: "Email and password are required" });
//   }

//   try {
//     const user = await User.findOne({ email }).select("+password");
//     if (!user) {
//       return res.status(401).json({ message: "Invalid email or password" });
//     }

//     if (!user.isVerified) {
//       return res
//         .status(403)
//         .json({ message: "Please verify your email before logging in" });
//     }

//     const isPasswordValid = await bcrypt.compare(password, user.password);
//     if (!isPasswordValid) {
//       return res.status(401).json({ message: "Invalid email or password" });
//     }

//     const accessToken = generateAccessToken(user);
//     const refreshToken = generateRefreshToken(user);

//     res.cookie("refreshToken", refreshToken, {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === "production",
//       sameSite: "strict",
//       maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
//     });

//     return res.status(200).json({
//       message: "Login successful",
//       accessToken,
//       user: {
//         id: user._id,
//         name: user.name,
//         email: user.email,
//       },
//     });
//   } catch (error) {
//     console.error("Login error:", error);
//     return res.status(500).json({ message: "Server error" });
//   }
// };

// export const refreshToken = async (req: Request, res: Response) => {
//   const refreshToken = req.cookies.refreshToken;

//   if (!refreshToken) {
//     return res.status(401).json({ message: "No refresh token" });
//   }

//   try {
//     const decoded = jwt.verify(
//       refreshToken,
//       process.env.REFRESH_TOKEN_SECRET!
//     ) as { id: string };

//     const user = await User.findById(decoded.id);

//     if (!user) {
//       return res.status(401).json({ message: "Invalid refresh token" });
//     }

//     const newAccessToken = generateAccessToken(user);
//     return res.json({ accessToken: newAccessToken });
//   } catch (error) {
//     return res.status(401).json({ message: "Invalid refresh token" });
//   }
// };

// export const logout = (req: Request, res: Response) => {
//   res.clearCookie("refreshToken", {
//     httpOnly: true,
//     secure: process.env.NODE_ENV === "production",
//     sameSite: "strict",
//     path: "/",
//   });

//   res.json({ message: "Logged out" });
// };

// export const me = async (req: Request, res: Response) => {
//   try {
//     // req.user is set by protect middleware
//     const user = await User.findById(req.user._id).select("-password");
//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     res.json({
//       user: {
//         id: user._id,
//         name: user.name,
//         email: user.email,
//       },
//     });
//   } catch (error) {
//     console.error("ME endpoint error:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// export const forgotPassword = async (req: Request, res: Response) => {
//   const { email } = req.body;
//   if (!email) return res.status(400).json({ message: "Email is required" });

//   try {
//     const user = await User.findOne({ email });
//     if (!user) {
//       // Security: do not reveal existence
//       return res.json({
//         message: "If the email exists, a reset link was sent",
//       });
//     }

//     const resetToken = crypto.randomBytes(32).toString("hex");
//     user.resetPasswordToken = resetToken;
//     user.resetPasswordExpires = new Date(Date.now() + 3600000);
//     await user.save();

//     const resetUrl = `${process.env.CLIENT_URL}/verify-email?token=${resetToken}&type=reset`;
//     await sendPasswordResetEmail(email, resetToken, resetUrl);

//     return res.json({ message: "Password reset link sent to your email" });
//   } catch (error) {
//     console.error("Forgot password error:", error);
//     return res.status(500).json({ message: "Server error" });
//   }
// };

// export const resetPassword = async (req: Request, res: Response) => {
//   const { token } = req.query;
//   const { password, confirmPassword } = req.body;

//   if (!token || typeof token !== "string") {
//     return res.status(400).json({ message: "Invalid token" });
//   }
//   if (!password || !confirmPassword) {
//     return res.status(400).json({ message: "Both passwords are required" });
//   }
//   if (password !== confirmPassword) {
//     return res.status(400).json({ message: "Passwords do not match" });
//   }

//   try {
//     const user = await User.findOne({
//       resetPasswordToken: token,
//       resetPasswordExpires: { $gt: Date.now() },
//     });

//     if (!user) {
//       return res.status(400).json({ message: "Invalid or expired token" });
//     }

//     user.password = await bcrypt.hash(password, 10);
//     user.resetPasswordToken = undefined;
//     user.resetPasswordExpires = undefined;
//     await user.save();

//     return res.json({ message: "Password reset successfully" });
//   } catch (error) {
//     console.error("Reset password error:", error);
//     return res.status(500).json({ message: "Server error" });
//   }
// };

// export const verifyResetToken = async (req: Request, res: Response) => {
//   const { token } = req.query;

//   try {
//     const user = await User.findOne({
//       resetPasswordToken: token,
//       resetPasswordExpires: { $gt: Date.now() },
//     });

//     if (!user) {
//       return res
//         .status(400)
//         .json({ message: "Invalid or expired reset token" });
//     }

//     res.status(200).json({ message: "Reset token verified", valid: true });
//   } catch (error) {
//     console.error("Verify reset token error:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// src/interfaces/controllers/AuthController.ts
import { Request, Response } from "express";
import { RegisterUser } from "../../../application/use-cases/auth/RegisterUser";
import { VerifyEmail } from "../../../application/use-cases/auth/VerifyEmail";
import { LoginUser } from "../../../application/use-cases/auth/LoginUser";
import { RefreshToken } from "../../../application/use-cases/auth/RefreshToken";
import { LogoutUser } from "../../../application/use-cases/auth/LogoutUser";
import { GetMe } from "../../../application/use-cases/auth/GetMe";
import { ForgotPassword } from "../../../application/use-cases/auth/ForgotPassword";
import { ResetPassword } from "../../../application/use-cases/auth/ResetPassword";
import { VerifyResetToken } from "../../../application/use-cases/auth/VerifyResetToken";

// Dependency container (simple DI – you can replace with Inversify, tsyringe, etc.)
export class AuthController {
  constructor(
    private registerUC: RegisterUser,
    private verifyEmailUC: VerifyEmail,
    private loginUC: LoginUser,
    private refreshUC: RefreshToken,
    private logoutUC: LogoutUser,
    private meUC: GetMe,
    private forgotUC: ForgotPassword,
    private resetUC: ResetPassword,
    private verifyResetUC: VerifyResetToken
  ) {}

  register = async (req: Request, res: Response) => {
    try {
      const result = await this.registerUC.execute(req.body);
      res.status(201).json(result);
    } catch (e: any) {
      res.status(400).json({ message: e.message });
    }
  };

  verifyEmail = async (req: Request, res: Response) => {
    try {
      const { token } = req.query;
      if (typeof token !== "string") throw new Error("Invalid token");
      const msg = await this.verifyEmailUC.execute(token);
      res.json(msg);
    } catch (e: any) {
      res.status(400).json({ message: e.message });
    }
  };

  login = async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      const { accessToken, refreshToken, user } = await this.loginUC.execute(
        email,
        password
      );

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.json({ message: "Login successful", accessToken, user });
    } catch (e: any) {
      res.status(401).json({ message: e.message });
    }
  };

  refreshToken = async (req: Request, res: Response) => {
    const token = req.cookies.refreshToken;
    if (!token) return res.status(401).json({ message: "No refresh token" });

    try {
      const { accessToken } = await this.refreshUC.execute(token);
      res.json({ accessToken });
    } catch (e: any) {
      res.status(401).json({ message: e.message });
    }
  };

  logout = (_: Request, res: Response) => {
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });
    res.json({ message: "Logged out" });
  };

  me = async (req: Request, res: Response) => {
    // @ts-ignore – set by protect middleware
    const userId: string = req.user._id;
    try {
      const data = await this.meUC.execute(userId);
      res.json(data);
    } catch (e: any) {
      res.status(404).json({ message: e.message });
    }
  };

  forgotPassword = async (req: Request, res: Response) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    try {
      const msg = await this.forgotUC.execute(email);
      res.json(msg);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  };

  resetPassword = async (req: Request, res: Response) => {
    const { token } = req.query as { token: string };
    const { password, confirmPassword } = req.body;

    try {
      const msg = await this.resetUC.execute(token, password, confirmPassword);
      res.json(msg);
    } catch (e: any) {
      res.status(400).json({ message: e.message });
    }
  };

  verifyResetToken = async (req: Request, res: Response) => {
    const { token } = req.query as { token: string };
    try {
      const { valid } = await this.verifyResetUC.execute(token);
      res.json({ message: "Reset token verified", valid });
    } catch (e: any) {
      res.status(400).json({ message: e.message });
    }
  };
}
