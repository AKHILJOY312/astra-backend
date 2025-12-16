// src/domain/entities/User.ts
export interface UserProps {
  id?: string;
  name: string;
  email: string;
  password: string;
  isVerified: boolean;
  isAdmin: boolean;
  isBlocked: boolean;
  imageUrl?: string;
  verificationToken?: string | null;
  verificationTokenExpires?: Date | null;
  resetPasswordToken?: string | null;
  resetPasswordExpires?: Date | null;
  securityStamp: string;
  createdAt?: Date;
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
  get isBlocked(): boolean {
    return this._props.isBlocked;
  }
  get ImageUrl(): string | undefined {
    return this._props.imageUrl;
  }
  get securityStamp(): string | undefined {
    return this._props.securityStamp;
  }
  get createdAt(): Date | undefined {
    return this._props.createdAt;
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

  setSecurityStamp(stamp: string): void {
    this._props.securityStamp = stamp;
  }
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
  setBlockStatus(isBlocked: boolean): void {
    this._props.isBlocked = isBlocked;
  }
  setAdminRole(isAdmin: boolean): void {
    this._props.isAdmin = isAdmin;
  }
  setImageUrl(imageUrl: string): void {
    this._props.imageUrl = imageUrl;
  }
}
