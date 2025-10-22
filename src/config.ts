import dotenv from 'dotenv';
import path from 'path';

dotenv.config({
  path: path.resolve(`${process.cwd()}`, `${process.env.NODE_ENV}.env`),
});

const config: any = {
  NODE_ENV: process.env.NODE_ENV,
  HOST: process.env.HOST || 'localhost',
  PORT: process.env.PORT || 3000,
  MONGO_URL: process.env.MONGO_URL,
  DB_NAME: process.env.DB_NAME,
  TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN,
  TWILIO_PHONE_NUMBER: process.env.TWILIO_PHONE_NUMBER,
  JWT_SECRET: process.env.JWT_SECRET || 'JWT_SECRET',
  JWT_EXPIRATION_TIME: process.env.JWT_EXPIRATION_TIME || '20d',
  JWT_FORGOT_EXPIRATION_TIME: process.env.JWT_FORGOT_EXPIRATION_TIME || '10m',
  JWT_PURPOSE_RESET: process.env.JWT_PURPOSE_RESET || 'Reset Password',
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
  AWS_SES_REGION: process.env.AWS_SES_REGION,
  SES_VERIFIED_SENDER: process.env.SES_VERIFIED_SENDER,
  AWS_BUCKET_NAME: process.env.AWS_BUCKET_NAME || 'ronesdy',
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  STRIPE_CURRENCY: process.env.STRIPE_CURRENCY,
  STRIPE_COUNTRY: process.env.STRIPE_COUNTRY,
  STRIPE_CONTROLLER: process.env.STRIPE_CONTROLLER,
  STRIPE_DASHBOARD: process.env.STRIPE_DASHBOARD,
  APPLE_SHARED_SECRET: process.env.APPLE_SHARED_SECRET,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
};

export default config;
