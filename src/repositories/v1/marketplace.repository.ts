// marketplace.repository.ts
import mongoose from 'mongoose';
import { Cart, ICart } from '../../models/v1/cart.model';
import {
  IMarketplaceFile,
  MarketplaceFile,
} from '../../models/v1/marketplace.model';
import { MARKETPLACE_CONTROLLER } from '../../utils/enum';
import { Purchase } from '../../models/v1/purchase.model';

export default class MarketplaceRepository {
  async getRecentFiles(
    userID: string,
    limit: number = 10,
  ): Promise<IMarketplaceFile[]> {
    return MarketplaceFile.find({
      userID: { $ne: userID },
      status: MARKETPLACE_CONTROLLER.STATUS.APPROVED,
    })
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
  }

  async getCategoryFiles(userID: string, limit: number = 10): Promise<any[]> {
    const pipeline: any = [
      {
        $match: {
          userID: { $ne: new mongoose.Types.ObjectId(userID) },
          courseName: { $exists: true },
          status: MARKETPLACE_CONTROLLER.STATUS.APPROVED,
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $group: {
          _id: '$courseName',
          files: { $push: '$$ROOT' },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          courseName: '$_id',
          files: { $slice: ['$files', limit] },
          count: 1,
        },
      },
      { $sort: { count: -1 } },
      { $limit: 6 },
    ];

    return MarketplaceFile.aggregate(pipeline).exec();
  }

  async uploadToMarketplace(entry: any): Promise<IMarketplaceFile> {
    try {
      const marketplaceEntry = new MarketplaceFile(entry);
      return await marketplaceEntry.save();
    } catch (error) {
      throw new Error(MARKETPLACE_CONTROLLER.VALIDATION.UPLOAD_FAILED);
    }
  }

  async addToCart(userId: string, fileId: string): Promise<ICart> {
    try {
      const cartItem = new Cart({
        userId,
        fileId,
      });
      return await cartItem.save();
    } catch (error: any) {
      if (error.code === 11000) {
        throw new Error(MARKETPLACE_CONTROLLER.VALIDATION.ALREADY_IN_CART);
      } else {
        throw error;
      }
    }
  }

  async getCartItems(userId: string): Promise<any[]> {
    try {
      const cartItemsWithFiles = await Cart.aggregate([
        {
          $match: { userId: new mongoose.Types.ObjectId(userId) },
        },
        {
          $lookup: {
            from: 'marketplacefiles',
            localField: 'fileId',
            foreignField: '_id',
            as: 'marketplaceFileDetails',
          },
        },
        {
          $unwind: {
            path: '$marketplaceFileDetails',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            _id: 1,
            userId: 1,
            fileId: 1,
            marketplaceFileDetails: 1,
          },
        },
      ]).exec();

      return cartItemsWithFiles;
    } catch (error) {
      throw error;
    }
  }

  async searchMarketplaceFiles(
    searchQuery: string,
    limit: number = 25,
  ): Promise<IMarketplaceFile[]> {
    const searchQueryRegex = new RegExp(searchQuery, 'i');

    return MarketplaceFile.find({
      $or: [
        { title: { $regex: searchQueryRegex } },
        { courseName: { $regex: searchQueryRegex } },
        { lecture: { $regex: searchQueryRegex } },
        { noteTaker: { $regex: searchQueryRegex } },
        { description: { $regex: searchQueryRegex } },
      ],
    })
      .limit(limit)
      .exec();
  }

  async getUserUploads(userID: string): Promise<IMarketplaceFile[]> {
    try {
      const statuses = [
        MARKETPLACE_CONTROLLER.STATUS.APPROVED,
        MARKETPLACE_CONTROLLER.STATUS.PENDING,
        MARKETPLACE_CONTROLLER.STATUS.REJECTED,
      ];
      return await MarketplaceFile.find({
        userID,
        status: { $in: statuses },
      }).exec();
    } catch (error) {
      throw error;
    }
  }

  async getFileDetailsById(fileId: string): Promise<IMarketplaceFile | null> {
    try {
      return await MarketplaceFile.findById(fileId).exec();
    } catch (error) {
      throw error;
    }
  }

  async updateMarketplaceFile(
    userID: string,
    listingId: string,
    updateData: any,
  ): Promise<IMarketplaceFile | null> {
    const file = await MarketplaceFile.findById(listingId);
    if (!file) {
      throw new Error(MARKETPLACE_CONTROLLER.VALIDATION.NO_FILE_FOUND);
    }
    if (file.userID.toString() !== userID) {
      throw new Error(MARKETPLACE_CONTROLLER.VALIDATION.EDIT_UNAUTHORIZED);
    }

    Object.assign(file, updateData);
    return file.save();
  }

  async getFilesByStatus(
    userID: string,
    status: string,
  ): Promise<IMarketplaceFile[]> {
    try {
      return await MarketplaceFile.find({ userID, status }).exec();
    } catch (error) {
      throw error;
    }
  }

  async removeFromCart(userId: string, fileId: string): Promise<void> {
    try {
      await Cart.findOneAndDelete({
        userId: new mongoose.Types.ObjectId(userId),
        fileId: new mongoose.Types.ObjectId(fileId),
      }).exec();
    } catch (error) {
      throw new Error(
        MARKETPLACE_CONTROLLER.VALIDATION.REMOVE_FROM_CART_FAILED,
      );
    }
  }

  async purchaseHistory(entry: any): Promise<any> {
    try {
      const purchaseEntry = new Purchase(entry);
      return await purchaseEntry.save();
    } catch (error) {
      throw new Error(
        MARKETPLACE_CONTROLLER.VALIDATION.ADD_PURCHASE_HISTORY_FAILED,
      );
    }
  }

  async getUserPurchaseHistory(userID: any) {
    try {
      const purchases = await Purchase.find({ userID })
        .populate('marketplaceID')
        .exec();
      return purchases;
    } catch (error) {
      throw new Error(
        MARKETPLACE_CONTROLLER.VALIDATION.FETCH_PURCHASE_HISTORY_FAILED,
      );
    }
  }

  async getUserSalesData(sellerID: any) {
    try {
      const result = await MarketplaceFile.aggregate([
        { $match: { userID: new mongoose.Types.ObjectId(sellerID) } },
        {
          $lookup: {
            from: 'purchases',
            localField: '_id',
            foreignField: 'marketplaceID',
            as: 'purchases',
          },
        },
        {
          $unwind: {
            path: '$purchases',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $group: {
            _id: '$_id',
            fileDetails: { $first: '$title' },
            quantitySold: {
              $sum: {
                $cond: [{ $ifNull: ['$purchases._id', false] }, 1, 0],
              },
            },
            totalProfit: {
              $sum: {
                $cond: [
                  { $ifNull: ['$purchases.price', false] },
                  { $toDouble: '$purchases.price' },
                  0,
                ],
              },
            },
          },
        },
        {
          $project: {
            _id: false,
            fileDetails: '$fileDetails',
            quantitySold: '$quantitySold',
            totalProfit: '$totalProfit',
          },
        },
      ]);

      return result;
    } catch (error) {
      throw new Error(
        MARKETPLACE_CONTROLLER.VALIDATION.FETCH_SALES_REPORT_FAILED,
      );
    }
  }
}
