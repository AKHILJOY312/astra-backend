// src/core/entities/ProjectMembership.ts
export type ProjectRole = "manager" | "lead" | "member";

export interface ProjectMembershipProps {
  id?: string;
  projectId: string;
  userId: string;
  role: ProjectRole;
  joinedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export class ProjectMembership {
  private _props: ProjectMembershipProps;

  constructor(props: ProjectMembershipProps) {
    this._props = {
      ...props,
      joinedAt: props.joinedAt || new Date(),
      role: props.role || "member",
    };
  }

  // ======= GETTERS =======
  get id() {
    return this._props.id;
  }
  get projectId() {
    return this._props.projectId;
  }
  get userId() {
    return this._props.userId;
  }
  get role() {
    return this._props.role;
  }
  get joinedAt() {
    return this._props.joinedAt;
  }
  get createdAt() {
    return this._props.createdAt;
  }
  get updatedAt() {
    return this._props.updatedAt;
  }

  // ======= ACTIONS =======
  changeRole(newRole: ProjectRole) {
    this._props.role = newRole;
  }

  promoteToLead() {
    this._props.role = "lead";
  }

  promoteToManager() {
    this._props.role = "manager";
  }

  demoteToMember() {
    this._props.role = "member";
  }

  // ======= SETTERS =======
  setId(id: string) {
    this._props.id = id;
  }

  setJoinedAt(date: Date) {
    this._props.joinedAt = date;
  }

  setCreatedAt(date: Date) {
    this._props.createdAt = date;
  }

  setUpdatedAt(date: Date) {
    this._props.updatedAt = date;
  }

  public toJSON() {
    return { ...this._props };
  }
}
