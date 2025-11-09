import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.NODEMAILER_Email,
    pass: process.env.NODEMAILER_Password,
  },
});
console.log(process.env.NODEMAILER_Email, process.env.NODEMAILER_Password);
// Optional: Verify transporter on startup (recommended)
transporter.verify((error) => {
  if (error) {
    console.error("SMTP transporter error:", error);
  } else {
    console.log("SMTP transporter is ready");
  }
});

export const sendVerificationEmail = async (email: string, token: string) => {
  const verificationUrl = `${process.env.CLIENT_URL}/verify-email?token=${token}`;

  const mailOptions = {
    from: process.env.NODEMAILER_Email,
    to: email,
    subject: "Verify Your Email",
    html: `
      <h2>Email Verification</h2>
      <p>Click the link below to verify your email:</p>
      <a href="${verificationUrl}"><b>Verify Email</b></a>
      <p>This link expires in 1 hour.</p>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Verification email sent:", info.messageId);
    return info; // Optional: return info if needed
  } catch (error: any) {
    console.error("Failed to send verification email:", {
      to: email,
      error: error.message,
      code: error.code,
      response: error.response,
    });

    // Re-throw with a clean message or custom error
    throw new Error(`Failed to send verification email: ${error.message}`);
  }
};

export const sendPasswordResetEmail = async (
  email: string,
  token: string,
  resetUrl: string
) => {
  const mailOptions = {
    from: process.env.NODEMAILER_Email,
    to: email,
    subject: "Reset Your Password",
    html: `
      <h2>You requested a password reset.</h2>
      <p>Click the link below to verify your email:</p>
      <a href="${resetUrl}"><b>Reset your Password</b></a>
      <p>This link expires in 1 hour.</p>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Reset Password email sent:", info.messageId);
    return info; // Optional: return info if needed
  } catch (error: any) {
    console.error("Failed to send Reset Password email:", {
      to: email,
      error: error.message,
      code: error.code,
      response: error.response,
    });

    // Re-throw with a clean message or custom error
    throw new Error(`Failed to send verification email: ${error.message}`);
  }
};
