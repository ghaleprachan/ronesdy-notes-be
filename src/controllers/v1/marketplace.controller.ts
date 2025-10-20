// marketplace.controller.ts
import { NextFunction, Request, Response } from 'express';
import MarketplaceRepository from '../../repositories/v1/marketplace.repository';
import WalletRepository from '../../repositories/v1/wallet.repository';
import UserRepository from '../../repositories/v1/user.repository';
import { StatusCodes } from 'http-status-codes';
import { APPLE_CONTROLLER, CONTROLLERS, MARKETPLACE_CONTROLLER, PURCHASE_TYPES, USER_CONTROLLER } from '../../utils/enum';
import { BadRequestError } from '../../middleware/errorHandlingMiddleware';
import { verifyReceipt } from '../../services/apple/verifyReciept';

export default class MarketplaceController {
  private readonly marketplaceRepository: MarketplaceRepository;
  private readonly walletRepository: WalletRepository;
  public readonly userRepository: UserRepository;

  constructor() {
    this.marketplaceRepository = new MarketplaceRepository();
    this.walletRepository = new WalletRepository();
    this.userRepository = new UserRepository();
  }

  async getMarketplaceFiles(req: Request, res: Response, next: NextFunction) {
    const userID = req.body.userID;
    try {
      const recentFiles = await this.marketplaceRepository.getRecentFiles(userID);
      const categoryFiles = await this.marketplaceRepository.getCategoryFiles(userID);

      res.status(StatusCodes.OK).json({
        success: true,
        data: {
          recentlyAdded: recentFiles,
          categories: categoryFiles,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async uploadFileToMarketplace(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    console.log(req.body);
    const userID = req.body.userID;
    const {
      title,
      description,
      status,
      courseName,
      noteTaker,
      lecture,
      bgColor,
      university,
      type,
      price,
      previewCanvases
    } = req.body;
    const fileID = req.body.fileID;

    if (!fileID) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: MARKETPLACE_CONTROLLER.VALIDATION.NO_FILE_ID,
      });
    }

    try {
      let wallet = await this.walletRepository.getWalletByUserId(userID);
      if (!wallet) {
        let userDetails = await this.userRepository.findByID(userID);
        const stripeCustomer: any = await this.walletRepository.createStripeCustomer(
          userDetails.email,
        );
        wallet = await this.walletRepository.createWallet(
          userID,
          stripeCustomer.id,
        );
      }
      const entry = {
        title,
        description,
        userID,
        fileID,
        status,
        courseName,
        noteTaker,
        lecture,
        bgColor,
        university,
        type,
        price,
        previewCanvases
      };

      const marketplaceEntry =
        await this.marketplaceRepository.uploadToMarketplace(entry);

      res.status(StatusCodes.CREATED).json({
        success: true,
        message: MARKETPLACE_CONTROLLER.SUCCESS.FILE_UPLOADED,
        data: marketplaceEntry,
      });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }

  async addToCart(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.body.userID;
      const { fileId } = req.body;

      const cartItem = await this.marketplaceRepository.addToCart(userId, fileId);

      res.status(StatusCodes.CREATED).json({
        success: true,
        message: MARKETPLACE_CONTROLLER.SUCCESS.ADDED_TO_CART,
        data: cartItem,
      });
    } catch (error: any) {
      if (error.message === MARKETPLACE_CONTROLLER.VALIDATION.ALREADY_IN_CART) {
        res.status(StatusCodes.CONFLICT).json({
          success: false,
          message: error.message,
        });
      } else {
        next(error);
      }
    }
  }

  async getCart(req: Request, res: Response, next: NextFunction) {
    const userId = req.body.userID;

    try {
      const cartItems = await this.marketplaceRepository.getCartItems(userId);

      res.json({
        success: true,
        message: MARKETPLACE_CONTROLLER.SUCCESS.CART_FETCHED,
        data: cartItems,
      });
    } catch (error) {
      next(error);
    }
  }

  async searchMarketplaceFiles(req: Request, res: Response, next: NextFunction) {
    const searchQuery = String(req.query.q || '').trim();
    if (!searchQuery) {
      return res.status(StatusCodes.OK).json({
        success: true,
        data: []
      });
    }
    
    const limit = parseInt(String(req.query.limit)) || 25;

    try {
      const searchResults = await this.marketplaceRepository.searchMarketplaceFiles(searchQuery, limit);
      res.status(StatusCodes.OK).json({
        success: true,
        data: searchResults
      });
    } catch (error) {
      next(error);
    }
  }

  async getUserUploads(req: Request, res: Response, next: NextFunction) {
    const userID = req.body.userID;
    try {
      const userUploads = await this.marketplaceRepository.getUserUploads(userID);
      res.status(StatusCodes.OK).json({
        success: true,
        message: MARKETPLACE_CONTROLLER.SUCCESS.UPLOADS_FETCHED,
        data: userUploads,
      });
    } catch (error) {
      next(error);
    }
  }

  async getFileDetails(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;
    try {
      const fileDetails = await this.marketplaceRepository.getFileDetailsById(id);
      res.status(StatusCodes.OK).json({
        success: true,
        message: MARKETPLACE_CONTROLLER.SUCCESS.FILE_DETAILS_FETCHED,
        data: fileDetails,
      });
    } catch (error) {
      next(error);
    }
  }

  async editMarketplaceFile(req: Request, res: Response, next: NextFunction) {
    const { userID, listingId, ...updateData } = req.body;
    if (!listingId) {
      return res.status(StatusCodes.BAD_REQUEST).send({
        success: false,
        message: MARKETPLACE_CONTROLLER.VALIDATION.NO_LISTING_ID,
      });
    }

    try {
      const editedFile = await this.marketplaceRepository.updateMarketplaceFile(
        userID,
        listingId,
        updateData
      );

      res.status(StatusCodes.OK).json({
        success: true,
        message: MARKETPLACE_CONTROLLER.SUCCESS.FILE_UPDATED,
        data: editedFile,
      });
    } catch (error) {
      next(error);
    }
  }

  async getDraftFiles(req: Request, res: Response, next: NextFunction) {
    const userID = req.body.userID;
    try {
      const draftFiles = await this.marketplaceRepository.getFilesByStatus(userID, 'DRAFT');
      res.status(StatusCodes.OK).json({
        success: true,
        message: MARKETPLACE_CONTROLLER.SUCCESS.DRAFT_FETCHED,
        data: draftFiles,
      });
    } catch (error) {
      next(error);
    }
  }

  async removeFromCart(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.body.userID;
      const { fileId } = req.body;

      if (!fileId) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          message: MARKETPLACE_CONTROLLER.VALIDATION.NO_FILE_ID,
        });
      }

      await this.marketplaceRepository.removeFromCart(userId, fileId);

      res.status(StatusCodes.OK).json({
        success: true,
        message: MARKETPLACE_CONTROLLER.SUCCESS.REMOVED_FROM_CART,
      });
    } catch (error) {
      next(error);
    }
  }

  async buyNote(req: Request, res: Response, next: NextFunction) {
    try {
      const userID = req.body.userID;
      const { receipt, transactionId, marketplaceID, price } = req.body;
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
        const entry = {
          userID,
          transactionId,
          marketplaceID,
          type: PURCHASE_TYPES.IAP,
          price
        }
        await this.marketplaceRepository.purchaseHistory(entry);
        await this.walletRepository.addBalance(userID, price);
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
      next(error);
    }
  }

  async getUserSalesData(req: Request, res: Response, next: NextFunction) {
    const userID = req.body.userID;
    try {
      const salesData = await this.marketplaceRepository.getUserSalesData(userID);
      res.status(StatusCodes.OK).json({
        success: true,
        message: MARKETPLACE_CONTROLLER.SUCCESS.DRAFT_FETCHED,
        data: salesData,
      });
    } catch (error) {
      next(error);
    }
  }
}
