import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import config from '../config';
import { User } from '../models/v1/user.model';
import { StatusCodes } from 'http-status-codes';
import { MIDDLEWARE } from '../utils/enum';
import { Admin } from '../models/v1/admin.model';

const JWT_SECRET = config.JWT_SECRET!;

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const authHeader = req.header('Authorization');
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ message: MIDDLEWARE.FAILURE.INVALID_TOKEN });
    return;
  }

  try {
    const decodedToken: any = jwt.verify(token, JWT_SECRET);
    req.body.userID = decodedToken.userID;

    const user = await User.findOne({ _id: decodedToken.userID });
    if (user && user?._id) {
      req.body.user = user;
    } else {
      res.status(404).json({ message: MIDDLEWARE.FAILURE.NO_USER });
      return;
    }
    next();
  } catch (error) {
    res.status(401).json({ message: MIDDLEWARE.FAILURE.AUTH_FAILED });
  }
};

export const authenticateAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const authHeader = req.header('Authorization');
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ message: MIDDLEWARE.FAILURE.INVALID_TOKEN });
    return;
  }

  try {
    const decodedToken: any = jwt.verify(token, JWT_SECRET);
    req.body.userID = decodedToken.userID;

    const user = await Admin.findOne({ _id: decodedToken.userID });

    if (user && user._id) {
      req.body.user = user;
      next();
    } else {
      res.status(404).json({ message: MIDDLEWARE.FAILURE.NO_USER });
    }
  } catch (error) {
    res.status(401).json({ message: MIDDLEWARE.FAILURE.AUTH_FAILED });
  }
};
