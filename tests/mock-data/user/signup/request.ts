import mongoose from 'mongoose';
import { RegisterTypeEnum } from '../../../../src/dto/v1/common/user.dto'; // Import your RegisterTypeEnum definition

interface UserData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  registerType: RegisterTypeEnum.GOOGLE | RegisterTypeEnum.EMAIL;
}

const generateRandomEmail = () => {
  const username = Math.random().toString(36).substring(7);
  return `${username}@example.com`;
};

export const signupRequest: UserData = {
  firstName: 'John',
  lastName: 'Doe',
  email: generateRandomEmail(),
  password: 'your_password_here',
  registerType: RegisterTypeEnum.EMAIL
};