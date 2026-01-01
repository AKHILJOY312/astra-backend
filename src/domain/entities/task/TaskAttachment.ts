export interface TasksAttachmentProps {
  id?: string;
  taskId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  fileUrl: string;
  thumbnailUrl?: string;
  uploadedAt?: Date;
}

export class TasksAttachment {
  private _props: TasksAttachmentProps;

  constructor(props: TasksAttachmentProps) {
    this._props = { ...props };
  }

  //ReadOnly getters
  get id(): string | undefined {
    return this._props.id;
  }
  get taskId(): string {
    return this._props.taskId;
  }
  get fileName(): string {
    return this._props.fileName;
  }
  get fileType(): string {
    return this._props.fileType;
  }
  get fileSize(): number {
    return this._props.fileSize;
  }
  get fileUrl(): string {
    return this._props.fileUrl;
  }
  get thumbnailUrl(): string | null | undefined {
    return this._props.thumbnailUrl;
  }
  get uploadedAt(): Date | undefined {
    return this._props.uploadedAt;
  }

  //Internal Mutators (used by repository)
  setId(id: string): void {
    this._props.id = id;
  }
  setTaskId(taskId: string): void {
    this._props.taskId = taskId;
  }
  setFileName(fileName: string): void {
    this._props.fileName = fileName;
  }
  setFileType(fileType: string): void {
    this._props.fileType = fileType;
  }
  setFileSize(size: number) {
    this._props.fileSize = size;
  }
  setFileUrl(url: string) {
    this._props.fileUrl = url;
  }
  setThumbnailUrl(description: string) {
    this._props.thumbnailUrl = description;
  }
  setUploadedAt(date: Date) {
    this._props.uploadedAt = date;
  }
}
