// src/domain/interfaces/IEmailService.ts
export interface IEmailService {
  /** Sends the email verification link */
  sendVerification(email: string, token: string): Promise<void>;

  /** Sends the password-reset link */
  sendPasswordReset(
    email: string,
    token: string,
    resetUrl: string
  ): Promise<void>;
}
