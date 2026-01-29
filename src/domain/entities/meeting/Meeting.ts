export type MeetingStatus = "active" | "ended";

export interface MeetingParticipant {
  userId?: string;
  socketId?: string;
  joinedAt: Date;
  leftAt?: Date;
}

export interface MeetingProps {
  id?: string;
  code: string;
  createdBy?: string | null;
  status: MeetingStatus;
  maxParticipants: number;
  participants: MeetingParticipant[];
  createdAt?: Date;
  updatedAt?: Date;
}

export class Meeting {
  private _props: MeetingProps;

  constructor(props: MeetingProps) {
    this._props = {
      ...props,
      participants: props.participants.map((p) => ({ ...p })),
    };
  }

  //=========== GETTERS===========
  get id() {
    return this._props.id;
  }

  get code() {
    return this._props.code;
  }

  get createdBy() {
    return this._props.createdBy;
  }

  get status() {
    return this._props.status;
  }

  get maxParticipants() {
    return this._props.maxParticipants;
  }

  get participants(): MeetingParticipant[] {
    return this._props.participants.map((p) => ({ ...p }));
  }
  get createdAt() {
    return this._props.createdAt ? new Date(this._props.createdAt) : undefined;
  }

  get updatedAt() {
    return this._props.updatedAt ? new Date(this._props.updatedAt) : undefined;
  }

  //==========STATE CHANGES========

  setId(id: string) {
    this._props.id = id;
  }

  end() {
    if (this._props.status === "ended") {
      throw new Error("Meeting already ended");
    }
    this._props.status = "ended";
  }

  addParticipants(participant: MeetingParticipant) {
    if (this._props.status !== "active") {
      throw new Error("Cannot join an ended meeting");
    }
    if (this._props.participants.length >= this._props.maxParticipants) {
      throw new Error("Meeting is full");
    }

    this._props.participants.push({ ...participant });
  }

  removeParticipant(socketId: string) {
    this._props.participants = this._props.participants.map((p) =>
      p.socketId === socketId ? { ...p, leftAt: new Date() } : p,
    );
  }

  public toJSON(): MeetingProps {
    return {
      ...this._props,
      participants: this._props.participants.map((p) => ({ ...p })),
      createdAt: this._props.createdAt
        ? new Date(this._props.createdAt)
        : undefined,
      updatedAt: this._props.updatedAt
        ? new Date(this._props.updatedAt)
        : undefined,
    };
  }
}
