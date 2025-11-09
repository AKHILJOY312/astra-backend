// // src/interfaces/http/controllers/AuthController.ts
// import { Request, Response } from "express";
// import { RegisterUserUseCase } from "../../../application/use-cases/auth/RegisterUserUseCase";
// import { VerifyEmailUseCase } from "../../../application/use-cases/auth/VerifyEmailUseCase";
// import { LoginUserUseCase } from "../../../application/use-cases/auth/LoginUserUseCase";
// import { RefreshTokenUseCase } from "../../../application/use-cases/auth/RefreshTokenUseCase";
// import { ForgotPasswordUseCase } from "../../../application/use-cases/auth/ForgotPasswordUseCase";
// import { ResetPasswordUseCase } from "../../../application/use-cases/auth/ResetPasswordUseCase";

// import { UserRepositoryImpl } from "../../../frameworks/db/repositories/UserRepositoryImpl";
// import { JwtService } from "../../../frameworks/auth/JwtService";
// import { EmailService } from "../../../frameworks/email/EmailService";

// export class AuthController {
//   private registerUseCase: RegisterUserUseCase;
//   private verifyEmailUseCase: VerifyEmailUseCase;
//   private loginUseCase: LoginUserUseCase;
//   private refreshTokenUseCase: RefreshTokenUseCase;
//   private forgotPasswordUseCase: ForgotPasswordUseCase;
//   private resetPasswordUseCase: ResetPasswordUseCase;

//   constructor() {
//     const userRepo = new UserRepositoryImpl();
//     const jwtService = new JwtService();
//     const emailService = new EmailService();

//     this.registerUseCase = new RegisterUserUseCase(userRepo, emailService);
//     this.verifyEmailUseCase = new VerifyEmailUseCase(userRepo);
//     this.loginUseCase = new LoginUserUseCase(userRepo, jwtService);
//     this.refreshTokenUseCase = new RefreshTokenUseCase(userRepo, jwtService);
//     this.forgotPasswordUseCase = new ForgotPasswordUseCase(userRepo, emailService);
//     this.resetPasswordUseCase = new ResetPasswordUseCase(userRepo);
//   }

//   // REGISTER
//   register = async (req: Request, res: Response) => {
//     const { name, email, password, confirmPassword } = req.body;

//     if (!name || !email || !password || !confirmPassword) {
//       return res.status(400).json({ message: "All fields are required" });
//     }

//     if (password !== confirmPassword) {
//       return res.status(400).json({ message: "Passwords do not match" });
//     }

//     try {
//       await this.registerUseCase.execute({ name, email, password });
//       return res.status(201).json({
//         message: "User registered. Please check your email to verify your account.",
//       });
//     } catch (err: any) {
//       return res.status(400).json({ message: err.message });
//     }
//   };

//   // VERIFY EMAIL
//   verifyEmail = async (req: Request, res: Response) => {
//     const { token } = req.query;
//     if (!token || typeof token !== "string") {
//       return res.status(400).json({ message: "Invalid token" });
//     }

//     try {
//       await this.verifyEmailUseCase.execute(token);
//       return res.status(200).json({ message: "Email verified successfully. You can now log in." });
//     } catch (err: any) {
//       return res.status(400).json({ message: err.message });
//     }
//   };

//   // LOGIN
//   login = async (req: Request, res: Response) => {
//     const { email, password } = req.body;

//     if (!email || !password) {
//       return res.status(400).json({ message: "Email and password are required" });
//     }

//     try {
//       const { accessToken, refreshToken, user } = await this.loginUseCase.execute({ email, password });

//       res.cookie("refreshToken", refreshToken, {
//         httpOnly: true,
//         secure: process.env.NODE_ENV === "production",
//         sameSite: "strict",
//         maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
//       });

//       return res.status(200).json({
//         message: "Login successful",
//         accessToken,
//         user: { id: user.id, name: user.name, email: user.email },
//       });
//     } catch (err: any) {
//       return res.status(401).json({ message: err.message });
//     }
//   };

//   // REFRESH TOKEN
//   refreshToken = async (req: Request, res: Response) => {
//     const refreshToken = req.cookies.refreshToken;
//     if (!refreshToken) return res.status(401).json({ message: "No refresh token" });

//     try {
//       const accessToken = await this.refreshTokenUseCase.execute(refreshToken);
//       return res.json({ accessToken });
//     } catch (err: any) {
//       return res.status(401).json({ message: err.message });
//     }
//   };

//   // LOGOUT
//   logout = (_req: Request, res: Response) => {
//     res.clearCookie("refreshToken", {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === "production",
//       sameSite: "strict",
//       path: "/",
//     });
//     return res.json({ message: "Logged out successfully" });
//   };

//   // ME (PROTECTED)
//   me = async (req: Request, res: Response) => {
//     try {
//       const user = await User.findById(req.user._id).select("-password");
//       if (!user) return res.status(404).json({ message: "User not found" });

//       return res.json({
//         user: { id: user._id, name: user.name, email: user.email },
//       });
//     } catch (err) {
//       return res.status(500).json({ message: "Server error" });
//     }
//   };

//   // FORGOT PASSWORD
//   forgotPassword = async (req: Request, res: Response) => {
//     const { email } = req.body;
//     if (!email) return res.status(400).json({ message: "Email is required" });

//     try {
//       await this.forgotPasswordUseCase.execute(email);
//       return res.json({ message: "Password reset link sent to your email" });
//     } catch (err: any) {
//       return res.status(400).json({ message: err.message });
//     }
//   };

//   // RESET PASSWORD
//   resetPassword = async (req: Request, res: Response) => {
//     const { token } = req.query;
//     const { password, confirmPassword } = req.body;

//     if (!token || typeof token !== "string") {
//       return res.status(400).json({ message: "Invalid token" });
//     }
//     if (!password || !confirmPassword) {
//       return res.status(400).json({ message: "Both passwords are required" });
//     }
//     if (password !== confirmPassword) {
//       return res.status(400).json({ message: "Passwords do not match" });
//     }

//     try {
//       await this.resetPasswordUseCase.execute(token, password);
//       return res.json({ message: "Password reset successfully" });
//     } catch (err: any) {
//       return res.status(400).json({ message: err.message });
//     }
//   };
// }
import { Request, Response } from "express";
import User from "../../../frameworks/db/schema/User";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
} from "../../../utils/sendEmail";

const generateAccessToken = (user: any) => {
  return jwt.sign(
    { id: user._id, email: user.email },
    process.env.ACCESS_TOKEN_SECRET!,
    { expiresIn: "15m" }
  );
};

const generateRefreshToken = (user: any) => {
  return jwt.sign({ id: user._id }, process.env.REFRESH_TOKEN_SECRET!, {
    expiresIn: "7d",
  });
};

export const register = async (req: Request, res: Response) => {
  const { name, email, password, confirmPassword } = req.body;

  if (!name || !email || !password || !confirmPassword) {
    return res.status(400).json({ message: "All fields are required" });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ message: "Passwords do not match" });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationTokenExpires = Date.now() + 3600000; // 1 hour

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      verificationToken: verificationToken,
      verificationTokenExpires: verificationTokenExpires,
    });

    await sendVerificationEmail(email, verificationToken);

    res.status(201).json({
      message:
        "User registered. Please check your email to verify your account.",
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const verifyEmail = async (req: Request, res: Response) => {
  const { token } = req.query;
  try {
    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpires: { $gt: Date.now() },
    });
    console.log("this.is working ");
    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    res
      .status(200)
      .json({ message: "Email verified successfully. You can now log in." });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (!user.isVerified) {
      return res
        .status(403)
        .json({ message: "Please verify your email before logging in" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return res.status(200).json({
      message: "Login successful",
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({ message: "No refresh token" });
  }

  try {
    const decoded = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET!
    ) as { id: string };

    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    const newAccessToken = generateAccessToken(user);
    return res.json({ accessToken: newAccessToken });
  } catch (error) {
    return res.status(401).json({ message: "Invalid refresh token" });
  }
};

export const logout = (req: Request, res: Response) => {
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
  });
  console.log("this.is working ");

  res.json({ message: "Logged out" });
};

export const me = async (req: Request, res: Response) => {
  try {
    // req.user is set by protect middleware
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("ME endpoint error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email is required" });

  try {
    const user = await User.findOne({ email });
    if (!user) {
      // Security: do not reveal existence
      return res.json({
        message: "If the email exists, a reset link was sent",
      });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(Date.now() + 3600000);
    await user.save();

    const resetUrl = `${process.env.CLIENT_URL}/verify-email?token=${resetToken}&type=reset`;
    await sendPasswordResetEmail(email, resetToken, resetUrl);

    return res.json({ message: "Password reset link sent to your email" });
  } catch (error) {
    console.error("Forgot password error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  const { token } = req.query;
  const { password, confirmPassword } = req.body;

  if (!token || typeof token !== "string") {
    return res.status(400).json({ message: "Invalid token" });
  }
  if (!password || !confirmPassword) {
    return res.status(400).json({ message: "Both passwords are required" });
  }
  if (password !== confirmPassword) {
    return res.status(400).json({ message: "Passwords do not match" });
  }

  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return res.json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Reset password error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const verifyResetToken = async (req: Request, res: Response) => {
  const { token } = req.query;

  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });
    console.log(user);
    if (!user) {
      return res
        .status(400)
        .json({ message: "Invalid or expired reset token" });
    }

    res.status(200).json({ message: "Reset token verified", valid: true });
  } catch (error) {
    console.error("Verify reset token error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
