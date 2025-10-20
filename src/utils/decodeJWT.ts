import { Request } from "express";
import jwt from 'jsonwebtoken';
import config from "../config";
const JWT_SECRET = config.JWT_SECRET!;

export function getUserIDFromJWT(req: Request) {
  try {
    const authHeader = req.header('Authorization');
    const token: any = authHeader && authHeader.split(' ')[1];
    const decodedToken: any = jwt.verify(token, JWT_SECRET);
    let userID = decodedToken.userID;
    return userID;
  } catch (e) {
    return e;
  }
}
