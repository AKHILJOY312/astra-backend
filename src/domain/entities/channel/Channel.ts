// src/core/entities/Channel.ts
export interface ChannelProps {
  id?: string;
  projectId: string;
  channelName: string;
  description?: string;
  createdBy: string;
  isPrivate: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Channel {
  private _props: ChannelProps;

  constructor(props: ChannelProps) {
    this._props = {
      ...props,
      description: props.description || "",
      isPrivate: props.isPrivate ?? false,
    };
  }

  // ======= GETTERS =======
  get id() {
    return this._props.id;
  }
  get projectId() {
    return this._props.projectId;
  }
  get channelName() {
    return this._props.channelName;
  }
  get description() {
    return this._props.description;
  }
  get createdBy() {
    return this._props.createdBy;
  }
  get isPrivate() {
    return this._props.isPrivate;
  }
  get createdAt() {
    return this._props.createdAt;
  }
  get updatedAt() {
    return this._props.updatedAt;
  }

  // ======= ACTIONS =======
  rename(name: string) {
    if (!name.trim()) throw new Error("Channel name cannot be empty");
    this._props.channelName = name.trim();
  }

  updateDescription(description?: string) {
    this._props.description = description?.trim() || "";
  }

  makePrivate() {
    this._props.isPrivate = true;
  }

  makePublic() {
    this._props.isPrivate = false;
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
