export interface AttachmentProps {
  id: string;
  messageId: string;
  uploadedBy: string;
  fileName: string;
  fileType: string; // image/png, application/pdf, etc.
  fileSize: number; // bytes
  fileUrl: string;
  thumbnailUrl?: string;
  uploadedAt: string;
}

export class Attachment {
  private readonly props: AttachmentProps;

  constructor(props: AttachmentProps) {
    this.props = Object.freeze({ ...props });
  }

  get id(): string {
    return this.props.id;
  }

  get messageId(): string {
    return this.props.messageId;
  }

  get uploadedBy(): string {
    return this.props.uploadedBy;
  }

  get fileName(): string {
    return this.props.fileName;
  }

  get fileType(): string {
    return this.props.fileType;
  }

  get fileSize(): number {
    return this.props.fileSize;
  }

  get fileUrl(): string {
    return this.props.fileUrl;
  }

  get thumbnailUrl(): string | undefined {
    return this.props.thumbnailUrl;
  }

  get uploadedAt(): Date {
    return new Date(this.props.uploadedAt);
  }

  public isImage(): boolean {
    return this.props.fileType.startsWith("image/");
  }

  public toJSON(): AttachmentProps {
    return { ...this.props };
  }
}
