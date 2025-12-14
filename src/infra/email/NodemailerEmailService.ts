// src/infrastructure/email/NodemailerEmailService.ts
import nodemailer from "nodemailer";
import { IEmailService } from "../../application/ports/services/IEmailService";
// Create transporter once (reused across requests)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.NODEMAILER_Email,
    pass: process.env.NODEMAILER_Password,
  },
});

// Optional: Verify on startup
transporter.verify((error) => {
  if (error) {
    console.error("SMTP transporter error:", error);
  } else {
    console.log("SMTP transporter is ready to send emails");
  }
});

export class NodemailerEmailService implements IEmailService {
  async sendVerification(email: string, token: string): Promise<void> {
    const verificationUrl = `${process.env.CLIENT_URL}/verify-email?token=${token}`;

    const mailOptions = {
      from: process.env.NODEMAILER_Email,
      to: email,
      subject: "Verify Your Email",
      html: `
        <h2>Email Verification</h2>
        <p>Click the link below to verify your email:</p>
        <a href="${verificationUrl}" style="color: #1a73e8; font-weight: bold;">Verify Email</a>
        <p>This link expires in 1 hour.</p>
      `,
    };

    try {
      const info = await transporter.sendMail(mailOptions);
      console.log("Verification email sent:", info.messageId);
    } catch (error: any) {
      console.error("Failed to send verification email:", {
        to: email,
        error: error.message,
        code: error.code,
        response: error.response,
      });
      throw new Error(`Failed to send verification email: ${error.message}`);
    }
  }

  async sendPasswordReset(
    email: string,
    token: string,
    resetUrl: string
  ): Promise<void> {
    const mailOptions = {
      from: process.env.NODEMAILER_Email,
      to: email,
      subject: "Reset Your Password",
      html: `
        <h2>Password Reset Request</h2>
        <p>Click the link below to reset your password:</p>
        <a href="${resetUrl}" style="color: #1a73e8; font-weight: bold;">Reset Password</a>
        <p>This link expires in 1 hour.</p>
      `,
    };

    try {
      const info = await transporter.sendMail(mailOptions);
      console.log("Password reset email sent:", info.messageId);
    } catch (error: any) {
      console.error("Failed to send password reset email:", {
        to: email,
        error: error.message,
        code: error.code,
        response: error.response,
      });
      throw new Error(`Failed to send password reset email: ${error.message}`);
    }
  }
}
