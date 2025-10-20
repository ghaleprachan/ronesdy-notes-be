import mongoose, { Schema, Document } from 'mongoose';
import { RegisterTypeEnum, Status } from '../../dto/v1/common/user.dto';

export interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  registerType: RegisterTypeEnum.GOOGLE | RegisterTypeEnum.EMAIL;
  allotedStorage: number;
  usedStorage: number;
  isPromotionalEmailsEnabled: boolean | null;
  isPushNotificationsEnabled: boolean | null;
  createdAt: Date;
  updatedAt: Date;
  otp: string;
  otExpiration: Date;
  subscriptionPlan: Schema.Types.ObjectId;
  storagePlan: Schema.Types.ObjectId;
  status: Status.ACTIVE | Status.BANNED
}

const UserSchema: Schema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    registerType: {
      type: String,
      enum: [RegisterTypeEnum.GOOGLE, RegisterTypeEnum.EMAIL],
      required: true,
    },
    allotedStorage: { type: Number, default: 0 },
    usedStorage: { type: Number, default: 0 },
    isPromotionalEmailsEnabled: { type: Boolean, default: true },
    isPushNotificationsEnabled: { type: Boolean, default: true },
    otp: { type: String },
    otExpiration: { type: Date },
    otpVerified: { type: Boolean, default: false },
    subscriptionPlan: { type: Schema.Types.ObjectId, default: null },
    storagePlan: { type: Schema.Types.ObjectId, default: null },
    status: {
      type: String,
      enum: [Status.ACTIVE, Status.BANNED],
      required: true,
      default: Status.ACTIVE
    }
  },
  {
    timestamps: true, // Add createdAt and updatedAt fields
  },
);

export const User = mongoose.model<IUser>('User', UserSchema);
