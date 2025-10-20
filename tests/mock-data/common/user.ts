import mongoose from 'mongoose';
import { RegisterTypeEnum } from '../../../src/dto/v1/common/user.dto'; // Import your RegisterTypeEnum definition

interface UserData {
    _id: mongoose.Types.ObjectId;
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
  otpExpiration: Date;
}

const generateRandomEmail = () => {
  const username = Math.random().toString(36).substring(7);
  return `${username}@example.com`;
};

export const userData: UserData = {
  _id: new mongoose.Types.ObjectId("656098c7c66cea3f737d5e07"),
  firstName: 'John',
  lastName: 'Doe',
  email: generateRandomEmail(),
  password: 'your_password_here',
  registerType: RegisterTypeEnum.EMAIL,
  allotedStorage: 500, // Example value in MB
  usedStorage: 250, // Example value in MB
  isPromotionalEmailsEnabled: true,
  isPushNotificationsEnabled: false,
  createdAt: new Date(),
  updatedAt: new Date(),
  otp: '123456', // Example OTP
  otpExpiration: new Date(Date.now() + 10 * 60 * 1000), // Example expiration time (10 minutes from now)
};
