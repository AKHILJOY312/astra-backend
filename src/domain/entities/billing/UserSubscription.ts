export type SubscriptionStatus = "active" | "cancelled" | "expired" | "pending";

export interface UserSubscriptionProps {
  id?: string;
  userId: string;
  planType: string;
  amount: number;
  currency: string;
  startDate: Date;
  endDate?: Date | null;
  status: SubscriptionStatus;
  createdAt?: Date;
  updatedAt?: Date;
  razorPayOrderId?: string;
  razorpayPaymentId?: string;
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

  get razorPayOrderId() {
    return this._props.razorPayOrderId;
  }
  get razorpayPaymentId() {
    return this._props.razorpayPaymentId;
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
    this._props.status = "cancelled";
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

  setEndDate(date: Date | null) {
    this._props.endDate = date || undefined;
  }

  setUpdatedAt(date: Date) {
    this._props.updatedAt = date;
  }
  setPlan(planType: string, amount: number, currency: string) {
    this._props.planType = planType;
    this._props.amount = amount;
    this._props.currency = currency;
  }

  setOrderId(orderId: string) {
    this._props.razorPayOrderId = orderId;
  }
  setPaymentId(paymentId: string) {
    this._props.razorpayPaymentId = paymentId;
  }
  setStartDate(date: Date) {
    this._props.startDate = date;
  }

  setStatus(status: SubscriptionStatus) {
    this._props.status = status;
  }

  public toJSON() {
    return { ...this._props };
  }
}
