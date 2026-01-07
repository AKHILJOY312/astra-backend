export type PaymentStatus = "pending" | "captured" | "failed";

export interface BillingSnapshot {
  userName: string;
  userEmail: string;
}

export interface PaymentProps {
  id?: string;
  userId: string;
  planId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  method: string;
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  invoiceNumber: string;
  billingSnapshot: BillingSnapshot; // The "Golden Record"
  createdAt?: Date;
}

export class Payment {
  private _props: PaymentProps;

  constructor(props: PaymentProps) {
    // Deep-clone billingSnapshot to avoid accidental external mutation
    this._props = {
      ...props,
      billingSnapshot: { ...props.billingSnapshot },
    };
  }

  // ======= GETTERS =======
  get id() {
    return this._props.id;
  }

  get userId() {
    return this._props.userId;
  }

  get planId() {
    return this._props.planId;
  }

  get amount() {
    return this._props.amount;
  }

  get currency() {
    return this._props.currency;
  }

  get status() {
    return this._props.status;
  }

  get method() {
    return this._props.method;
  }

  get razorpayOrderId() {
    return this._props.razorpayOrderId;
  }

  get razorpayPaymentId() {
    return this._props.razorpayPaymentId;
  }

  get invoiceNumber() {
    return this._props.invoiceNumber;
  }

  get billingSnapshot() {
    return { ...this._props.billingSnapshot }; // defensive copy
  }

  get createdAt() {
    return this._props.createdAt ? new Date(this._props.createdAt) : undefined;
  }

  // ======= MUTATION METHODS / SETTERS =======

  setId(id: string) {
    this._props.id = id;
  }

  setUserId(userId: string) {
    this._props.userId = userId;
  }

  setPlanId(planId: string) {
    this._props.planId = planId;
  }

  setAmount(amount: number) {
    this._props.amount = amount;
  }

  setCurrency(currency: string) {
    this._props.currency = currency;
  }

  setStatus(status: PaymentStatus) {
    this._props.status = status;
  }

  setMethod(method: string) {
    this._props.method = method;
  }

  setRazorpayOrderId(orderId: string) {
    this._props.razorpayOrderId = orderId;
  }

  setRazorpayPaymentId(paymentId: string) {
    this._props.razorpayPaymentId = paymentId;
  }

  setInvoiceNumber(invoiceNumber: string) {
    this._props.invoiceNumber = invoiceNumber;
  }

  setBillingSnapshot(snapshot: BillingSnapshot) {
    this._props.billingSnapshot = { ...snapshot };
  }

  setCreatedAt(date: Date) {
    this._props.createdAt = new Date(date);
  }

  // ======= BUSINESS ACTIONS (optional but recommended) =======

  capture() {
    this._props.status = "captured";
  }

  fail() {
    this._props.status = "failed";
  }

  // ======= UTILITY METHODS =======

  public toJSON(): PaymentProps {
    return {
      ...this._props,
      billingSnapshot: { ...this._props.billingSnapshot },
      createdAt: this._props.createdAt
        ? new Date(this._props.createdAt)
        : undefined,
    };
  }
}
