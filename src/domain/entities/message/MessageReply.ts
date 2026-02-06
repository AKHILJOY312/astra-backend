export interface MessageReplyProps {
  id: string;
  parentMessageId: string;
  channelId: string;
  projectId: string;
  senderId: string;
  text: string;
  createdAt: string;
}

export class MessageReply {
  private readonly props: MessageReplyProps;

  constructor(props: MessageReplyProps) {
    this.props = Object.freeze({ ...props });
  }

  get id(): string {
    return this.props.id;
  }

  get parentMessageId(): string {
    return this.props.parentMessageId;
  }
  get channelId(): string {
    return this.props.channelId;
  }
  get projectId(): string {
    return this.props.projectId;
  }
  get senderId(): string {
    return this.props.senderId;
  }

  get text(): string {
    return this.props.text;
  }

  get createdAt(): Date {
    return new Date(this.props.createdAt);
  }

  public isTextEmpty(): boolean {
    return this.props.text.trim().length === 0;
  }

  public toJSON(): MessageReplyProps {
    return { ...this.props };
  }
}
