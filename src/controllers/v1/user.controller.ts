/**
 * User Controller
 * Handles all user-related operations including authentication, profile management, and user data operations.
 * This controller implements the business logic for user-related endpoints.
 */

import { NextFunction, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { UserDTO } from '../../dto/v1/common/user.dto';
import AuthValidation from '../../validation/auth.validation';
import UserRepository from '../../repositories/v1/user.repository';
import { LoginDTO } from '../../dto/v1/login.dto';
import { GetUserDTO } from '../../dto/v1/get-user.dto';
import config from '../../config';
import { UpdateUserProfileRequestDTO } from '../../dto/v1/user/profile/PATCH/request.dto';
import { GetUserCloudStorageResponseDTO } from '../../dto/v1/user/cloud-storage/GET/response.dto';
import PathRepository from '../../repositories/v1/path.repository';
import { ContactUsDTO } from '../../dto/v1/user/profile/contact-us/request.dto';
import { ResetPasswordDTO } from '../../dto/v1/user/reset-password/request.dto';
import { GetUserResponseDTO } from '../../dto/v1/user/id/GET/response.dto';
import { UpdatePasswordRequestDTO } from '../../dto/v1/user/password/PATCH/request.dto';
import {
  BadRequestError,
  ConflictError,
  InternalServerError,
  NotFoundError,
} from '../../middleware/errorHandlingMiddleware';
import { deserializeToDTO } from '../../utils/deserializer';
import {
  APPLE_CONTROLLER,
  CONTROLLERS,
  MIDDLEWARE,
  PURCHASE_TYPES,
  USER_CONTROLLER,
} from '../../utils/enum';
import { StatusCodes } from 'http-status-codes';
import AWSStorage from '../../services/aws/aws.storage';
import EmailService, { Email } from '../../services/aws/SES';
import { getUserIDFromJWT } from '../../utils/decodeJWT';
import { VerifyOtpDTO } from '../../dto/v1/user/verify-otp/request.dto';
import { generateForgotJWT, generateJWT } from '../../utils/generateJWT';
import { verifyReceipt } from '../../services/apple/verifyReciept';
import MarketplaceRepository from '../../repositories/v1/marketplace.repository';

const JWT_SECRET = config.JWT_SECRET;

export default class UserController {
  public readonly validator: AuthValidation;
  public readonly userRepository: UserRepository;
  public readonly AWSStorage: AWSStorage;
  public readonly pathRepository: PathRepository;
  public readonly marketplaceRepository: MarketplaceRepository;
  public readonly emailService: EmailService;

  constructor() {
    this.validator = new AuthValidation();
    this.userRepository = new UserRepository();
    this.AWSStorage = new AWSStorage();
    this.pathRepository = new PathRepository();
    this.emailService = new EmailService();
    this.marketplaceRepository = new MarketplaceRepository();
  }

  /**
   * Handles user registration
   * @param req - Express request object containing user registration data
   * @param res - Express response object
   * @param next - Express next function for error handling
   * @throws {ConflictError} If email already exists
   * @throws {InternalServerError} For any other server errors
   */
  async signup(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validationResult = this.validator.signupValidation(req);

      if (validationResult.error) {
        const errorDetails = validationResult.error.details.map((detail) => {
          return {
            message: detail.message,
            path: detail.path,
          };
        });

        res.status(StatusCodes.BAD_REQUEST).json({
          error: USER_CONTROLLER.VALIDATION.ERROR,
          details: errorDetails,
        });
        return;
      }
      const request = deserializeToDTO(req.body, UserDTO);
      const existingUser: any = await this.userRepository.findByEmail(
        request!.email,
      );
      if (
        (Array.isArray(existingUser) && existingUser.length > 0) ||
        existingUser?.email
      ) {
        next(
          new ConflictError(
            USER_CONTROLLER.AUTH.EMAIL_ALREADY_EXISTS,
            CONTROLLERS.USER_CONTROLLER,
          ),
        );
        return;
      }
      if (req.body.registerType === 'email') {
        const hashedPassword = await bcrypt.hash(request!.password, 10);
        request!.password = hashedPassword;
      }

      await this.userRepository.create(request!);

      const registeredUser: any = await this.userRepository.findByEmail(
        request!.email,
      );
      const token = generateJWT(registeredUser!._id);

      res.status(StatusCodes.CREATED).json({
        success: true,
        message: USER_CONTROLLER.SUCCESS.USER_REGISTERED,
        token,
      });
    } catch (error) {
      next(new InternalServerError());
    }
  }

  /**
   * Handles user login
   * @param req - Express request object containing login credentials
   * @param res - Express response object
   * @param next - Express next function for error handling
   * @throws {NotFoundError} If email not found
   * @throws {BadRequestError} If password is incorrect
   * @throws {InternalServerError} For any other server errors
   */
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const request = deserializeToDTO(req.body, LoginDTO);
      const user: any = await this.userRepository.findByEmail(request!.email);
      if (!user || user.length <= 0) {
        next(
          new NotFoundError(
            USER_CONTROLLER.AUTH.EMAIL_NOT_FOUND,
            CONTROLLERS.USER_CONTROLLER,
          ),
        );
        return;
      }

      if (user.registerType === 'email') {
        const passwordMatch = await bcrypt.compare(
          request!.password,
          user!.password,
        );

        if (!passwordMatch) {
          next(
            new BadRequestError(
              USER_CONTROLLER.AUTH.WRONG_PASSWORD,
              CONTROLLERS.USER_CONTROLLER,
            ),
          );
          return;
        }
      }

      const token = generateJWT(user._id);

      const response = deserializeToDTO(user, GetUserDTO);
      res.status(StatusCodes.OK).json({
        success: true,
        message: USER_CONTROLLER.SUCCESS.LOGIN_SUCCESSFUL,
        token,
        response,
      });
    } catch (error) {
      next(new InternalServerError());
    }
  }

  /**
   * Handles admin login
   * @param req - Express request object containing admin login credentials
   * @param res - Express response object
   * @param next - Express next function for error handling
   * @throws {NotFoundError} If email not found
   * @throws {BadRequestError} If password is incorrect
   * @throws {InternalServerError} For any other server errors
   */
  async adminLogin(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const request = deserializeToDTO(req.body, LoginDTO);
      const user: any = await this.userRepository.findAdminByEmail(request!.email);
      if (!user || user.length <= 0) {
        next(
          new NotFoundError(
            USER_CONTROLLER.AUTH.EMAIL_NOT_FOUND,
            CONTROLLERS.USER_CONTROLLER,
          ),
        );
        return;
      }
      const passwordMatch = await bcrypt.compare(
        request!.password,
        user!.password,
      );

      if (!passwordMatch) {
        next(
          new BadRequestError(
            USER_CONTROLLER.AUTH.WRONG_PASSWORD,
            CONTROLLERS.USER_CONTROLLER,
          ),
        );
        return;
      }

      const token = generateJWT(user._id);

      res.status(StatusCodes.OK).json({
        success: true,
        message: USER_CONTROLLER.SUCCESS.LOGIN_SUCCESSFUL,
        token,
        user,
      });
    } catch (error) {
      next(new InternalServerError());
    }
  }

  /**
   * Updates user profile picture
   * @param req - Express request object containing the image file
   * @param res - Express response object
   * @param next - Express next function for error handling
   * @returns The S3 upload response or null if no image provided
   */
  async updateProfilePic(req: Request, res: Response, next: NextFunction) {
    const userID = getUserIDFromJWT(req);
    let img = req.file;
    let key = `userProfiles/${userID}`;
    if (img) {
      const res = await this.AWSStorage.uploadToS3(img, key);
      return res;
    }
    return null;
  }

  /**
   * Validates user authentication token
   * @param req - Express request object
   * @param res - Express response object
   * @param next - Express next function for error handling
   * @throws {InternalServerError} For any server errors
   */
  async validateToken(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<any> {
    try {
      res
        .status(StatusCodes.OK)
        .json({ success: true, message: USER_CONTROLLER.SUCCESS.VALID_TOKEN });
    } catch (error) {
      next(new InternalServerError());
    }
  }

  /**
   * Retrieves user profile information
   * @param req - Express request object containing user ID
   * @param res - Express response object
   * @param next - Express next function for error handling
   * @throws {InternalServerError} For any server errors
   */
  async getUserProfile(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<any> {
    const userID = req.body.userID;
    const user = req.body.user;
    let response;
    try {
      response = deserializeToDTO(user!, GetUserResponseDTO);
      res.status(StatusCodes.OK).json({
        success: true,
        message: USER_CONTROLLER.SUCCESS.USER_FETCHED,
        response,
      });
    } catch (error) {
      next(new InternalServerError());
    }
  }

  async updatePassword(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<any> {
    const userID = req.body.userID;
    const user = req.body.user;
    try {
      const request = deserializeToDTO(req.body, UpdatePasswordRequestDTO);
      const passwordMatch = await bcrypt.compare(
        request!.password,
        user!.password,
      );

      if (passwordMatch) {
        next(
          new BadRequestError(
            USER_CONTROLLER.AUTH.SAME_AS_OLD_PASSWORD,
            CONTROLLERS.USER_CONTROLLER,
          ),
        );
        return;
      }

      const hashedPassword = await bcrypt.hash(request!.password, 10);
      user.password = hashedPassword;
      await user.save();

      const token = generateJWT(user._id);

      const response = deserializeToDTO(user, GetUserDTO);
      res.status(StatusCodes.OK).json({
        success: true,
        message: USER_CONTROLLER.SUCCESS.PASSWORD_UPDATED,
        token,
        response,
      });
    } catch (error) {
      next(new InternalServerError());
    }
  }

  async deleteAccount(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<any> {
    const userID = req.body.userID;
    try {
      const response = await this.pathRepository.deleteAllUserData(userID);
      const deleteFilesRes = this.AWSStorage.deleteAllUserFiles(userID);
      let key = 'userProfiles/' + userID;
      const deleteProfileRes = await this.AWSStorage.deleteFile(key);
      res
        .status(StatusCodes.NO_CONTENT)
        .json({ success: true, message: USER_CONTROLLER.SUCCESS.USER_DELETED });
    } catch (error) {
      next(new InternalServerError());
    }
  }

  async contactUs(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<any> {
    try {
      const request = deserializeToDTO(req!.body, ContactUsDTO);
      const response = this.userRepository.createFeedback(request!);
      res
        .status(StatusCodes.CREATED)
        .json({ success: true, message: USER_CONTROLLER.SUCCESS.QUERY_ADDED });
    } catch (error) {
      next(new InternalServerError());
    }
  }

  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const validationResult = this.validator.resetPasswordValidation(req);

      if (validationResult.error) {
        const errorDetails = validationResult.error.details.map((detail) => {
          return {
            message: detail.message,
            path: detail.path,
          };
        });
        res.status(StatusCodes.BAD_REQUEST).json({
          error: USER_CONTROLLER.VALIDATION.ERROR,
          details: errorDetails,
        });
        return;
      }

      const request = deserializeToDTO(req.body, ResetPasswordDTO);
      const token = request!.token;

      if (!token) {
        next(
          new BadRequestError(
            MIDDLEWARE.FAILURE.INVALID_TOKEN,
            CONTROLLERS.USER_CONTROLLER,
          ),
        );
        return;
      }

      const decodedToken: any = jwt.verify(token, JWT_SECRET);
      if (decodedToken.email != request!.email) {
        next(
          new BadRequestError(
            MIDDLEWARE.FAILURE.INVALID_TOKEN,
            CONTROLLERS.USER_CONTROLLER,
          ),
        );
        return;
      }

      const user = await this.userRepository.findByEmail(request!.email);

      if (!Array.isArray(user) && user.password) {
        const passwordMatch = await bcrypt.compare(
          request!.password,
          user!.password,
        );

        if (passwordMatch) {
          next(
            new BadRequestError(
              USER_CONTROLLER.AUTH.SAME_AS_OLD_PASSWORD,
              CONTROLLERS.USER_CONTROLLER,
            ),
          );
          return;
        }
      } else {
        next(
          new NotFoundError(
            USER_CONTROLLER.AUTH.PASSWORD_NOT_FOUND,
            CONTROLLERS.USER_CONTROLLER,
          ),
        );
        return;
      }

      const hashedPassword = await bcrypt.hash(request!.password, 10);
      user.password = hashedPassword;
      await this.userRepository.updateUserByEmail(user);
      res.status(StatusCodes.OK).json({
        success: true,
        message: USER_CONTROLLER.SUCCESS.PASSWORD_UPDATED,
      });
    } catch (error) {
      next(new InternalServerError());
    }
  }

  async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;

      const user: any = await this.userRepository.findByEmail(email);

      if (!user || Array.isArray(user) || user.registerType == 'google') {
        next(
          new NotFoundError(
            USER_CONTROLLER.AUTH.USER_NOT_FOUND,
            CONTROLLERS.USER_CONTROLLER,
          ),
        );
        return;
      }

      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expirationTime = new Date(Date.now() + 5 * 60 * 1000); // 2 minutes from now

      user.setOTP(otp);
      user.setOTPExpiration(expirationTime);
      console.log(otp);
      const OTPEmail: Email = {
        bodyText: otp,
        recipient: email,
      };
      this.emailService.sendEmail(OTPEmail);
      await this.userRepository.updateUserByEmail(user);
      res
        .status(StatusCodes.OK)
        .json({ message: USER_CONTROLLER.SUCCESS.OTP_SENT, otp });
    } catch (error) {
      next(new InternalServerError());
    }
  }

  async updateProfile(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<any> {
    const userID = req.body.userID;
    try {
      const request = deserializeToDTO(req.body, UpdateUserProfileRequestDTO);
      const userDetails = await this.userRepository.updateProfile(
        userID,
        request!,
      );
      const response = deserializeToDTO(
        userDetails,
        UpdateUserProfileRequestDTO,
      );
      res.status(StatusCodes.OK).json({
        success: true,
        message: USER_CONTROLLER.SUCCESS.PROFILE_UPDATED,
        response,
      });
    } catch (error) {
      next(new InternalServerError());
    }
  }

  async getUserProfilePicture(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<any> {
    const userID = req.body.userID;
    let response;
    try {
      let key = 'userProfiles/' + userID;
      response = await this.AWSStorage.getAFile(key);
      res.status(StatusCodes.OK).json({
        success: true,
        message: USER_CONTROLLER.SUCCESS.USER_FETCHED,
        response,
      });
    } catch (error) {
      next(new InternalServerError());
    }
  }

  async DeleteProfilePicture(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<any> {
    const userID = req.body.userID;
    let response: any;
    try {
      let key = 'userProfiles/' + userID;
      response = await this.AWSStorage.deleteFile(key);
      res.status(StatusCodes.OK).json({
        success: true,
        message: USER_CONTROLLER.SUCCESS.USER_FETCHED,
        response,
      });
    } catch (error) {
      next(new InternalServerError());
    }
  }

  async verifyOTP(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<any> {
    try {
      const request = deserializeToDTO(req.body, VerifyOtpDTO);
      if (!request!.otp && !request!.email) {
        next(
          new BadRequestError(
            USER_CONTROLLER.AUTH.INCORRECT_PARAMETERS,
            CONTROLLERS.USER_CONTROLLER,
          ),
        );
        return;
      }

      const user = await this.userRepository.findByEmail(request!.email);
      if (!Array.isArray(user)) {
        if (user.otp !== request!.otp) {
          next(
            new BadRequestError(
              USER_CONTROLLER.AUTH.INVALID_OTP,
              CONTROLLERS.USER_CONTROLLER,
            ),
          );
          return;
        }
        if (user.otpExpiration && user.otpExpiration < new Date()) {
          next(
            new BadRequestError(
              USER_CONTROLLER.AUTH.OTP_EXPIRED,
              CONTROLLERS.USER_CONTROLLER,
            ),
          );
          return;
        }
        user.setOTP(null);
        user.setOTPExpiration(null);
        user.setOTPVerified(false);
        const token = generateForgotJWT(request!.email);
        await this.userRepository.updateUserByEmail(user);
        res.status(StatusCodes.OK).json({
          message: USER_CONTROLLER.AUTH.OTP_VERIFIED_SUCCESSFULLY,
          success: true,
          token,
        });
      }
    } catch (error) {
      next(new InternalServerError());
    }
  }

  async getUserSubscriptionDetails(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<any> {
    const userID = req.body.userID;
    try {
      const userDetails = await this.userRepository.findByID(userID);
      if (userDetails.length < 0) {
        next(
          new NotFoundError(
            USER_CONTROLLER.AUTH.EMAIL_NOT_FOUND,
            CONTROLLERS.USER_CONTROLLER,
          ),
        );
        return;
      }
      const storagePlan = userDetails.storagePlan;
      const subscriptionPlan = userDetails.subscriptionPlan;
      const details = await this.userRepository.getPlan(
        storagePlan,
        subscriptionPlan,
        userDetails.createdAt,
      );
      const storageUsed =
        await this.userRepository.calculateTotalStorageUsed(userID);
      res.status(StatusCodes.OK).json({
        success: true,
        message: '',
        ...details,
        storageUsed,
      });
    } catch (error) {
      next(new InternalServerError());
    }
  }

  async verifyReciept(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<any> {
    const userID = req.body.userID;
    try {
      const { receipt, transactionId, subscriptionType, planName, price } = req.body;

      if (!receipt) {
        next(
          new BadRequestError(
            USER_CONTROLLER.VALIDATION.RECIEPT_NOT_FOUND,
            CONTROLLERS.USER_CONTROLLER,
          ),
        );
      }

      let response: any = await verifyReceipt(
        receipt,
        APPLE_CONTROLLER.APPLE_RECIEPT_URL.PRODUCTION,
      );

      if (response.status === 21007) {
        response = await verifyReceipt(
          receipt,
          APPLE_CONTROLLER.APPLE_RECIEPT_URL.SANDBOX,
        );
      }
      if (response.status === 0) {
        await this.userRepository.updateUserSubscription(userID, subscriptionType, planName);
        res.status(StatusCodes.OK).json({
          success: true,
          message: APPLE_CONTROLLER.SUCCESS.VALID,
          response,
        });
      }
      else{
        res.status(StatusCodes.OK).json({
          success: false,
          error: APPLE_CONTROLLER.FAILURE.INVALID,
          response,
        });
      }
    } catch (error) {
      next(new InternalServerError());
    }
  }

  async getUserPurchaseHistory(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<any> {
    const userID = req.body.userID;
    try {
      let purchaseHistory = await this.marketplaceRepository.getUserPurchaseHistory(userID);
      res.status(StatusCodes.OK).json({
        success: true,
        message: USER_CONTROLLER.SUCCESS.PURCHASE_HISTORY_FETCHED,
        purchaseHistory,
      });
    } catch (error) {
      next(new InternalServerError());
    }
  }
}
