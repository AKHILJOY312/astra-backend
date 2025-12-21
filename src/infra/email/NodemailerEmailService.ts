// src/infrastructure/email/NodemailerEmailService.ts
import nodemailer, { Transporter, SendMailOptions } from "nodemailer";
import { IEmailService } from "@/application/ports/services/IEmailService";
import { injectable } from "inversify";
import { ENV } from "@/config/env.config";

@injectable()
export class NodemailerEmailService implements IEmailService {
  private transporter: Transporter;
  private fromEmail: string;
  private clientUrl: string;

  constructor() {
    const email = ENV.MAIL.USER;
    const pass = ENV.MAIL.PASS;
    this.clientUrl = ENV.CLIENT_URL || "http://localhost:5173";

    if (!email || !pass) {
      throw new Error(
        "NODEMAILER_EMAIL and NODEMAILER_PASS must be defined in .env"
      );
    }

    this.fromEmail = email;

    this.transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: email,
        pass,
      },
    });

    this.transporter.verify((error) => {
      if (error) {
        console.error("SMTP connection failed:", error);
      } else {
        console.log("SMTP ready – emails can be sent from:", email);
      }
    });
  }

  private getVerificationHtml(verificationUrl: string): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
        <h2 style="color: #1a73e8;">Verify Your Email Address</h2>
        <p>Thank you for signing up! Please confirm your email by clicking the button below:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" 
             style="background-color: #1a73e8; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
            Verify Email
          </a>
        </div>
        <p>Or copy and paste this link:</p>
        <p style="word-break: break-all; color: #555;">${verificationUrl}</p>
        <p><small>This link expires in 1 hour.</small></p>
      </div>
    `;
  }

  private getPasswordResetHtml(resetUrl: string): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
        <h2 style="color: #d93025;">Password Reset Request</h2>
        <p>We received a request to reset your password. Click the button below to set a new one:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" 
             style="background-color: #d93025; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
            Reset Password
          </a>
        </div>
        <p>Or copy and paste this link:</p>
        <p style="word-break: break-all; color: #555;">${resetUrl}</p>
        <p><small>This link expires in 1 hour. If you didn't request this, ignore this email.</small></p>
      </div>
    `;
  }

  async sendVerification(email: string, token: string): Promise<void> {
    const verificationUrl = `${this.clientUrl}/verify-email?token=${token}`;

    const mailOptions: SendMailOptions = {
      from: `"Your App" <${this.fromEmail}>`,
      to: email,
      subject: "Verify Your Email Address",
      html: this.getVerificationHtml(verificationUrl),
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log("Verification email sent:", info.messageId, "to:", email);
    } catch (error: unknown) {
      const err = error as Error; // Safe — nodemailer errors extend Error
      console.error("Failed to send verification email:", {
        to: email,
        message: err.message,
      });
      throw new Error(
        "Failed to send verification email. Please try again later."
      );
    }
  }

  async sendPasswordReset(email: string, token: string): Promise<void> {
    const resetUrl = `${this.clientUrl}/reset-password?token=${token}`;

    const mailOptions: SendMailOptions = {
      from: `"Your App" <${this.fromEmail}>`,
      to: email,
      subject: "Reset Your Password",
      html: this.getPasswordResetHtml(resetUrl),
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log("Password reset email sent:", info.messageId, "to:", email);
    } catch (error: unknown) {
      const err = error as Error;
      console.error("Failed to send password reset email:", {
        to: email,
        message: err.message,
      });
      throw new Error(
        "Failed to send password reset email. Please try again later."
      );
    }
  }
}
