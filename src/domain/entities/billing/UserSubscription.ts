// src/core/entities/UserSubscription.ts
export type PlanType = "free" | "premium" | "pro";
export type SubscriptionStatus = "active" | "canceled" | "expired" | "pending";

export interface UserSubscriptionProps {
  id?: string;
  userId: string;
  planType: PlanType;
  amount: number;
  currency: string;
  startDate: Date;
  endDate?: Date | null;
  status: SubscriptionStatus;
  stripeSubscriptionId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class UserSubscription {
  private _props: UserSubscriptionProps;

  constructor(props: UserSubscriptionProps) {
    this._props = { ...props };
  }

  // ======= GETTERS =======
  get id() {
    return this._props.id;
  }
  get userId() {
    return this._props.userId;
  }
  get planType() {
    return this._props.planType;
  }
  get amount() {
    return this._props.amount;
  }
  get currency() {
    return this._props.currency;
  }
  get startDate() {
    return this._props.startDate;
  }
  get endDate() {
    return this._props.endDate;
  }
  get status() {
    return this._props.status;
  }
  get stripeSubscriptionId() {
    return this._props.stripeSubscriptionId;
  }
  get createdAt() {
    return this._props.createdAt;
  }
  get updatedAt() {
    return this._props.updatedAt;
  }

  get isActive() {
    return (
      this._props.status === "active" &&
      (!this._props.endDate || this._props.endDate > new Date())
    );
  }

  // ======= ACTIONS =======
  activate() {
    this._props.status = "active";
  }

  cancel() {
    this._props.status = "canceled";
  }

  expire() {
    this._props.status = "expired";
  }

  renew(endDate: Date) {
    this._props.status = "active";
    this._props.endDate = endDate;
  }

  // ======= SETTERS =======
  setId(id: string) {
    this._props.id = id;
  }

  setStripeSubscriptionId(id: string) {
    this._props.stripeSubscriptionId = id;
  }

  setEndDate(date: Date | null) {
    this._props.endDate = date || undefined;
  }

  setUpdatedAt(date: Date) {
    this._props.updatedAt = date;
  }

  public toJSON() {
    return { ...this._props };
  }
}
