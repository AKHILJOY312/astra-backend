// src/domain/entities/User.ts
export interface UserProps {
  id?: string;
  name: string;
  email: string;
  password: string;
  isVerified: boolean;
  isAdmin: boolean;
  verificationToken?: string | null;
  verificationTokenExpires?: Date | null;
  resetPasswordToken?: string | null;
  resetPasswordExpires?: Date | null;
}

export class User {
  private _props: UserProps;

  constructor(props: UserProps) {
    this._props = { ...props };
  }

  // ---- READ-ONLY GETTERS ----
  get id(): string | undefined {
    return this._props.id;
  }
  get name(): string {
    return this._props.name;
  }
  get email(): string {
    return this._props.email;
  }
  get password(): string {
    return this._props.password;
  }
  get isVerified(): boolean {
    return this._props.isVerified;
  }
  get isAdmin(): boolean {
    return this._props.isAdmin;
  }
  get verificationToken(): string | null | undefined {
    return this._props.verificationToken;
  }
  get verificationTokenExpires(): Date | null | undefined {
    return this._props.verificationTokenExpires;
  }
  get resetPasswordToken(): string | null | undefined {
    return this._props.resetPasswordToken;
  }
  get resetPasswordExpires(): Date | null | undefined {
    return this._props.resetPasswordExpires;
  }

  // ---- INTERNAL MUTATORS (only repository) ----
  setId(id: string): void {
    this._props.id = id;
  }
  // set password(newPassword: string) {
  //   this.password = newPassword;
  // }
  // ---- BUSINESS METHODS ----
  verify(): void {
    this._props.isVerified = true;
  }

  clearVerificationToken(): void {
    this._props.verificationToken = null;
    this._props.verificationTokenExpires = null;
  }

  setResetToken(token: string, expires: Date): void {
    this._props.resetPasswordToken = token;
    this._props.resetPasswordExpires = expires;
  }

  clearResetToken(): void {
    this._props.resetPasswordToken = null;
    this._props.resetPasswordExpires = null;
  }

  setPassword(hash: string): void {
    this._props.password = hash;
  }
}
