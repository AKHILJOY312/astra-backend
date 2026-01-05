import { v4 as uuidv4 } from "uuid";

export type InvitationStatus = "pending" | "accepted" | "expired" | "revoked";

export interface InvitationProps {
  id?: string;
  projectId: string;
  email: string;
  role: "member" | "manager" | "lead";
  inviterId?: string; // Optional: who sent it
  token?: string;
  status?: InvitationStatus;
  createdAt?: Date;
  expiresAt: Date;
}

export class Invitation {
  private _props: InvitationProps;

  constructor(props: InvitationProps) {
    if (!props.projectId?.trim()) {
      throw new Error("projectId is required");
    }
    if (!props.email?.trim()) {
      throw new Error("email is required");
    }
    if (!this.isValidEmail(props.email)) {
      throw new Error("Invalid email format");
    }
    if (!["member", "manager"].includes(props.role)) {
      throw new Error("role must be 'member' or 'manager'");
    }
    if (props.expiresAt <= new Date()) {
      throw new Error("expiresAt must be a future date");
    }

    const normalizedEmail = props.email.toLowerCase().trim();

    this._props = {
      id: props.id ?? uuidv4(),
      projectId: props.projectId,
      email: normalizedEmail,
      role: props.role,
      inviterId: props.inviterId,
      token: props.token ?? uuidv4(),
      status: props.status ?? "pending",
      createdAt: props.createdAt ?? new Date(),
      expiresAt: props.expiresAt,
    };
  }

  // Getters
  get id() {
    return this._props.id;
  }
  get projectId() {
    return this._props.projectId;
  }
  get email() {
    return this._props.email;
  }
  get role() {
    return this._props.role;
  }
  get inviterId() {
    return this._props.inviterId;
  }
  get token() {
    return this._props.token;
  }
  get status() {
    return this._props.status;
  }
  get createdAt() {
    return this._props.createdAt;
  }
  get expiresAt() {
    return this._props.expiresAt;
  }

  // Business logic
  public isValid(): boolean {
    return this.status === "pending" && new Date() <= this.expiresAt;
  }

  public isExpired(): boolean {
    return new Date() > this.expiresAt;
  }

  public accept(): void {
    if (this.status !== "pending") {
      throw new Error("Only pending invitations can be accepted");
    }
    if (this.isExpired()) {
      throw new Error("Cannot accept an expired invitation");
    }
    this._props.status = "accepted";
  }

  public revoke(): void {
    if (this.status === "accepted") {
      throw new Error("Cannot revoke an already accepted invitation");
    }
    if (this.status !== "pending") {
      throw new Error("Only pending invitations can be revoked");
    }
    this._props.status = "revoked";
  }

  public expire(): void {
    if (this.status === "pending") {
      this._props.status = "expired";
    }
  }

  public toJSON() {
    return { ...this._props };
  }

  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
}
