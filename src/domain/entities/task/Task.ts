export type TaskStatus = "todo" | "inprogress" | "done";
export type TaskPriority = "low" | "medium" | "high" | "critical";

export interface TaskProps {
  id?: string;
  projectId: string;
  assignedBy: string;
  assignedTo: string;
  title: string;
  description?: string | null;
  hasAttachments?: boolean;
  status: TaskStatus;
  dueDate?: Date | null;
  priority: TaskPriority;
  createdAt: Date;
  updatedAt: Date;
}

export class Task {
  private _props: TaskProps;

  constructor(props: TaskProps) {
    this._props = {
      ...props,
      description: props.description ?? null,
      assignedBy: props.assignedBy ?? null,
      assignedTo: props.assignedTo ?? null,
      dueDate: props.dueDate ?? null,
      priority: props.priority ?? "medium",
    };
  }
  //getters
  get id(): string | undefined {
    return this._props.id;
  }
  get projectId(): string {
    return this._props.projectId;
  }
  get assignedBy(): string {
    return this._props.assignedBy;
  }
  get assignedTo(): string {
    return this._props.assignedTo;
  }
  get title(): string {
    return this._props.title;
  }
  get description(): string | null | undefined {
    return this._props.description;
  }
  get hasAttachments(): boolean | undefined {
    return this._props.hasAttachments;
  }
  get status(): TaskStatus {
    return this._props.status;
  }
  get dueDate(): Date | null | undefined {
    return this._props.dueDate;
  }
  get priority(): TaskPriority {
    return this._props.priority;
  }
  get createdAt(): Date {
    return this._props.createdAt;
  }
  get updatedAt(): Date {
    return this._props.updatedAt;
  }

  //Internal mutators
  setId(id: string): void {
    this._props.id = id;
  }
  setUpdatedAt(date: Date): void {
    this._props.updatedAt = date;
  }
  //Business Methods
  assignTo(userId: string): void {
    this._props.assignedTo = userId;
  }
  changeStatus(status: TaskStatus): void {
    this._props.status = status;
  }
  changePriority(priority: TaskPriority) {
    this._props.priority = priority;
  }
  updateTitle(title: string) {
    this._props.title = title;
  }
  updateDescription(description: string | null): void {
    this._props.description = description;
  }
  setDueDate(dueDate: Date | null): void {
    this._props.dueDate = dueDate;
  }
}
