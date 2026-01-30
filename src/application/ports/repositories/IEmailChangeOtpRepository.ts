// src/application/ports/repositories/IEmailChangeOtpRepository.ts
import { EmailChangeOtp } from "@/domain/entities/auth/EmailChangeOtp";

export interface CreateEmailChangeOtpDTO {
  userId: string;
  newEmail: string;
  otpHash: string;
  expiresAt: Date;
}

export interface EmailChangeOtpResponseDTO {
  userId: string;
  newEmail: string;
  attempts: number;
  expiresAt: Date;
  isExpired: boolean;
}
export interface IEmailChangeOtpRepository {
  /**
   * Retrieves the OTP Entity. Returns the Domain Entity
   * so the Use Case can use methods like .isValid() or .incrementAttempts()
   */
  findByUserId(userId: string): Promise<EmailChangeOtp | null>;

  /**
   * Creates or updates the record. Accepts a DTO.
   */
  upsert(data: EmailChangeOtp): Promise<void>;

  /**
   * Deletes record after successful verification or expiration
   */
  deleteByUserId(userId: string): Promise<void>;

  /**
   * Atomically increments attempts in the database
   */
  incrementAttempts(userId: string): Promise<void>;

  /**
   * Used for rate limiting
   */
  countRecentByUserId(userId: string, since: Date): Promise<number>;
}
