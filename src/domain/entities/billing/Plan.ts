export interface PlanProps {
  id?: string;
  name: string;
  description: string;
  price: number;
  finalAmount: number;
  currency: string;
  billingCycle: "monthly" | "yearly";
  features: string[];
  maxProjects: number;
  maxMembersPerProject: number;
  isActive: boolean;
  isDeleted: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
export class Plan {
  private _props: PlanProps;

  constructor(props: PlanProps) {
    this._props = { ...props };
  }

  // ======= GETTERS =======
  get id() {
    return this._props.id;
  }

  get name() {
    return this._props.name;
  }

  get description() {
    return this._props.description;
  }

  get price() {
    return this._props.price;
  }

  get finalAmount() {
    return this._props.finalAmount;
  }

  get currency() {
    return this._props.currency;
  }

  get billingCycle() {
    return this._props.billingCycle;
  }

  get features() {
    return this._props.features;
  }

  get maxProjects() {
    return this._props.maxProjects;
  }
  get maxMembersPerProject() {
    return this._props.maxMembersPerProject;
  }

  get isActive() {
    return this._props.isActive;
  }
  get isDeleted() {
    return this._props.isDeleted;
  }

  get createdAt() {
    return this._props.createdAt;
  }

  get updatedAt() {
    return this._props.updatedAt;
  }

  // ======= ACTIONS =======
  activate() {
    this._props.isActive = true;
  }

  deactivate() {
    this._props.isActive = false;
  }
  deletePlan() {
    this._props.isDeleted = true;
  }

  updatePrice(price: number) {
    this._props.price = price;
  }

  updateFinalAmount(amount: number) {
    this._props.finalAmount = amount;
  }

  updateFeatures(features: string[]) {
    this._props.features = features;
  }
  // ======= SETTERS / MUTATION METHODS =======
  setName(name: string) {
    this._props.name = name;
  }

  setDescription(desc: string) {
    this._props.description = desc;
  }

  setPrice(price: number) {
    this._props.price = price;
  }

  setFinalAmount(amount: number) {
    this._props.finalAmount = amount;
  }

  setCurrency(currency: string) {
    this._props.currency = currency;
  }

  setBillingCycle(cycle: "monthly" | "yearly") {
    this._props.billingCycle = cycle;
  }

  setFeatures(features: string[]) {
    this._props.features = features;
  }

  setMaxProjects(max: number) {
    this._props.maxProjects = max;
  }
  setMaxMembersPerProject(max: number) {
    this._props.maxMembersPerProject = max;
  }

  setActive(isActive: boolean) {
    this._props.isActive = isActive;
  }

  setUpdatedAt(date: Date) {
    this._props.updatedAt = date;
  }

  setId(id: string) {
    this._props.id = id;
  }
  public toJSON() {
    return this._props;
  }
}
