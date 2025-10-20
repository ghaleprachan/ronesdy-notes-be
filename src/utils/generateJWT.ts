import jwt from 'jsonwebtoken';
import config from '../config';

const JWT_SECRET = config.JWT_SECRET;
const JWT_EXPIRY = config.JWT_EXPIRATION_TIME;
const JWT_PURPOSE_RESET = config.JWT_PURPOSE_RESET;
const JWT_FORGOT_EXPIRATION_TIME = config.JWT_FORGOT_EXPIRATION_TIME;

export function generateJWT(userid: any) {
  try {
    const token = jwt.sign({ userID: userid }, JWT_SECRET, {
      expiresIn: JWT_EXPIRY,
    });
    return token;
  } catch (e) {
    return e;
  }
}

export function generateForgotJWT(email: any) {
  try {
    const token = jwt.sign(
      { email: email, purpose: JWT_PURPOSE_RESET },
      JWT_SECRET,
      {
        expiresIn: JWT_FORGOT_EXPIRATION_TIME,
      },
    );
    return token;
  } catch (e) {
    return e;
  }
}
