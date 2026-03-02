import mongoose, { InferSchemaType, Schema, model, models } from 'mongoose';

const baseOptions = {
  timestamps: true,
  toJSON: {
    virtuals: true,
    versionKey: false,
    transform: (_: any, ret: any) => {
      ret.id = ret._id.toString();
      delete ret._id;
    }
  }
};

// In dev, allow schema tweaks by clearing existing models (prevents stale schemas).
delete mongoose.models.User;
delete mongoose.models.IncomeProfile;
delete mongoose.models.Bill;
delete mongoose.models.CreditCard;
delete mongoose.models.MonthlySummary;

const historyEntry = new Schema(
  {
    amount: { type: Number, required: true },
    effectiveFrom: { type: String, required: true }
  },
  { _id: false }
);

const userSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    currency: { type: String, default: 'USD' },
    theme: { type: String, default: 'dark' }
  },
  baseOptions
);

const incomeProfileSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    member: { type: String, enum: ['primary', 'partner'], default: 'primary' },
    currentIncome: { type: Number, required: true },
    effectiveFrom: { type: Date, default: Date.now },
    history: { type: [historyEntry], default: [] }
  },
  baseOptions
);
incomeProfileSchema.index({ userId: 1, member: 1 }, { unique: true });

const billSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    member: { type: String, enum: ['primary', 'partner'], default: 'primary' },
    name: { type: String, required: true },
    amount: { type: Number, required: true },
    dueDay: { type: Number, required: true },
    nextDueDate: { type: Date, required: true },
    category: { type: String, required: true },
    active: { type: Boolean, default: true }
  },
  baseOptions
);

const creditCardSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    member: { type: String, enum: ['primary', 'partner'], default: 'primary' },
    name: { type: String, required: true },
    minPayment: { type: Number, required: true },
    balance: { type: Number },
    dueDay: { type: Number, required: true },
    nextDueDate: { type: Date, required: true },
    active: { type: Boolean, default: true }
  },
  baseOptions
);

const monthlySummarySchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    member: { type: String, enum: ['primary', 'partner'], default: 'primary' },
    month: { type: String, required: true },
    income: { type: Number, required: true },
    billTotal: { type: Number, required: true },
    cardMinTotal: { type: Number, required: true },
    remaining: { type: Number, required: true }
  },
  baseOptions
);
monthlySummarySchema.index({ userId: 1, member: 1, month: 1 }, { unique: true });

export type User = InferSchemaType<typeof userSchema> & { id: string };
export const UserModel = models.User || model('User', userSchema);

export type IncomeProfile = InferSchemaType<typeof incomeProfileSchema> & { id: string };
export const IncomeProfileModel = models.IncomeProfile || model('IncomeProfile', incomeProfileSchema);

export type Bill = InferSchemaType<typeof billSchema> & { id: string };
export const BillModel = models.Bill || model('Bill', billSchema);

export type CreditCard = InferSchemaType<typeof creditCardSchema> & { id: string };
export const CreditCardModel = models.CreditCard || model('CreditCard', creditCardSchema);

export type MonthlySummary = InferSchemaType<typeof monthlySummarySchema> & { id: string };
export const MonthlySummaryModel = models.MonthlySummary || model('MonthlySummary', monthlySummarySchema);
