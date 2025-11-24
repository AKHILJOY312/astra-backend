// src/core/entities/Project.ts
export interface ProjectProps {
  id?: string;
  projectName: string;
  imageUrl?: string | null;
  description?: string;
  ownerId: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Project {
  private _props: ProjectProps;

  constructor(props: ProjectProps) {
    this._props = {
      ...props,
      imageUrl: props.imageUrl || null,
      description: props.description || "",
    };
  }

  // ======= GETTERS =======
  get id() {
    return this._props.id;
  }
  get projectName() {
    return this._props.projectName;
  }
  get imageUrl() {
    return this._props.imageUrl;
  }
  get description() {
    return this._props.description;
  }
  get ownerId() {
    return this._props.ownerId;
  }
  get createdAt() {
    return this._props.createdAt;
  }
  get updatedAt() {
    return this._props.updatedAt;
  }

  // ======= ACTIONS =======
  updateName(name: string) {
    if (!name.trim()) throw new Error("Project name cannot be empty");
    this._props.projectName = name.trim();
  }

  updateDescription(description?: string) {
    this._props.description = description?.trim() || "";
  }

  updateImageUrl(imageUrl?: string | null) {
    this._props.imageUrl = imageUrl || null;
  }

  // ======= SETTERS =======
  setId(id: string) {
    this._props.id = id;
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
