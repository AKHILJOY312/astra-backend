export interface CommentProps {
  id?: string; // Optional for new commands before they hit the DB
  taskId: string;
  projectId: string;
  authorId: string;
  message: string;
  createdAt: Date;
  updatedAt: Date;
}

export class Comment {
  private _props: CommentProps;

  constructor(props: CommentProps) {
    this._props = {
      ...props,
      // Ensure we have a clean message and default dates if necessary
      message: props.message.trim(),
      createdAt: props.createdAt ?? new Date(),
      updatedAt: props.updatedAt ?? new Date(),
    };
  }

  // --- Getters ---
  get id(): string | undefined {
    return this._props.id;
  }

  get taskId(): string {
    return this._props.taskId;
  }

  get projectId(): string {
    return this._props.projectId;
  }

  get authorId(): string {
    return this._props.authorId;
  }

  get message(): string {
    return this._props.message;
  }

  get createdAt(): Date {
    return this._props.createdAt;
  }

  get updatedAt(): Date {
    return this._props.updatedAt;
  }

  // --- Internal Mutators ---
  setId(id: string): void {
    this._props.id = id;
  }

  private setUpdatedAt(date: Date): void {
    this._props.updatedAt = date;
  }

  // --- Business Methods ---

  /**
   * Updates the command message and automatically refreshes the updatedAt timestamp.
   */
  editMessage(newMessage: string): void {
    if (!newMessage.trim()) {
      throw new Error("Message cannot be empty");
    }
    this._props.message = newMessage.trim();
    this.setUpdatedAt(new Date());
  }

  /**
   * Validates if the user attempting an action is the original author.
   */
  isAuthor(userId: string): boolean {
    return this._props.authorId === userId;
  }
}
