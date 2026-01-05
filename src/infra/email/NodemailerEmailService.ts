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
  private getEmailChangeOtpHtml(newEmail: string, otp: string): string {
    return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; background: #1a1d21; color: #e0e0e0;">
      <h2 style="color: #a855f7; text-align: center;">Change Email Request</h2>
      <p>You've requested to change your account email to:</p>
      <p style="font-size: 18px; font-weight: bold; color: #fff; text-align: center;">${newEmail}</p>
      <p>Please verify this change by entering the OTP below in the app:</p>
      <div style="text-align: center; margin: 30px 0;">
        <span style="display: inline-block; font-size: 32px; font-weight: bold; letter-spacing: 8px; background: #232529; padding: 15px 30px; border-radius: 10px; color: #a855f7; border: 2px solid #a855f7;">
          ${otp}
        </span>
      </div>
      <p><strong>This OTP expires in 10 minutes.</strong></p>
      <p><small style="color: #9ca3af;">If you didn't request this change, please ignore this email or contact support immediately.</small></p>
    </div>
  `;
  }
  private getProjectInvitationHtml(
    projectName: string,
    inviterName: string,
    invitationLink: string,
    registrationLink: string
  ): string {
    return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; background: #ffffff;">
      <h2 style="color: #1a73e8; text-align: center;">You've Been Invited to Join a Project!</h2>
      
      <p><strong>${inviterName}</strong> has invited you to collaborate on the project:</p>
      
      <h3 style="color: #333; text-align: center; background: #f0f8ff; padding: 15px; border-radius: 8px;">
        ${projectName}
      </h3>

      <p><strong>Step 1:</strong> Create an account using this link:  
        <a href="${registrationLink}" style="color: #1a73e8; text-decoration: underline;">Register here</a>
      </p>
      <p><strong>Step 2:</strong> After registering and logging in, accept the invitation below.</p>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${invitationLink}"
           style="display: inline-block; background-color: #1a73e8; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
          Accept Invitation
        </a>
      </div>

      <p>Or copy and paste this link into your browser:</p>
      <p style="word-break: break-all; color: #555; background: #f5f5f5; padding: 10px; border-radius: 6px; font-size: 14px;">
        ${invitationLink}
      </p>

      <p><small>This invitation expires in 7 days.</small></p>

      <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;" />
      
      <p style="color: #666; font-size: 14px; text-align: center;">
        If you weren’t expecting this invitation, you can safely ignore this email.
      </p>
      <p style="font-size: 12px; color: #888; text-align: center;">
        For security, always verify the sender before clicking links.
      </p>
    </div>
  `;
  }
  async sendVerification(email: string, token: string): Promise<void> {
    const verificationUrl = `${this.clientUrl}/verify-email?token=${token}`;
    console.log("User verification Url: ", verificationUrl);
    const mailOptions: SendMailOptions = {
      from: `"Astra" <${this.fromEmail}>`,
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
    console.log("User reset password url:", resetUrl);
    const mailOptions: SendMailOptions = {
      from: `"Astra" <${this.fromEmail}>`,
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
  async sendEmailChangeOtp(email: string, otp: string): Promise<void> {
    const mailOptions: SendMailOptions = {
      from: `"Astra" <${this.fromEmail}>`,
      to: email,
      subject: "Verify Your Email Change -OTP Inside",
      html: this.getEmailChangeOtpHtml(email, otp),
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log("Email change OTP sent:", info.messageId, "to: ", email);
    } catch (error: unknown) {
      const err = error as Error;
      console.log("failed to send email change OTP:", err.message);
      throw new Error("Failed to send OTP. Please try again.");
    }
  }
  async sendProjectInvitation(
    email: string,
    projectName: string,
    inviterName: string,
    invitationLink: string,
    registrationLink: string
  ): Promise<void> {
    const mailOptions: SendMailOptions = {
      from: `"Astra Team" <${this.fromEmail}>`,
      to: email,
      subject: `Invitation to join "${projectName}" on Astra`,
      html: this.getProjectInvitationHtml(
        projectName,
        inviterName,
        invitationLink,
        registrationLink
      ),
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log("Project invitation sent:", info.messageId, "to:", email);
    } catch (error: unknown) {
      const err = error as Error;
      console.error("Failed to send project invitation:", {
        to: email,
        message: err.message,
      });
      throw new Error(
        "Failed to send invitation email. Please try again later."
      );
    }
  }
}
