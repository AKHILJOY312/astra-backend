export interface MessageProps {
  id: string;
  channelId: string;
  senderId: string;
  senderName: string;
  text: string;
  hasAttachments: boolean;
  hasReplies: boolean;
  createdAt: string;
  updatedAt: string;
}

export class Message {
  private readonly props: MessageProps;

  constructor(props: MessageProps) {
    this.props = Object.freeze({
      ...props,
    });
  }

  get id(): string {
    return this.props.id;
  }

  get channelId(): string {
    return this.props.channelId;
  }

  get senderId(): string {
    return this.props.senderId;
  }
  get senderName(): string {
    return this.props.senderName;
  }

  get text(): string {
    return this.props.text;
  }

  get hasAttachments(): boolean {
    return this.props.hasAttachments;
  }

  get hasReplies(): boolean {
    return this.props.hasReplies;
  }

  get createdAt(): Date {
    return new Date(this.props.createdAt);
  }

  get updatedAt(): Date {
    return new Date(this.props.updatedAt);
  }

  public isTextEmpty(): boolean {
    return this.props.text.trim().length === 0;
  }

  public toJSON(): MessageProps {
    return { ...this.props };
  }
}
