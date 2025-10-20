/**
 * User Repository
 * Handles all database operations related to users, including CRUD operations and user-specific queries.
 * Implements the IUserRepository interface for consistent user data access patterns.
 */

import mongoose, { Model } from 'mongoose';
import { UserDTO } from '../../dto/v1/common/user.dto';
import { IUser, User } from '../../models/v1/user.model';
import { IUserRepository } from '../v1/interfaces/user.interface';
import { JsonSerializer } from 'typescript-json-serializer';
import { UpdateUserProfileRequestDTO } from '../../dto/v1/user/profile/PATCH/request.dto';
import { Plan } from '../../models/v1/plan.model';
import { Contact } from '../../models/v1/contact.model';
import { ContactUsDTO } from '../../dto/v1/user/profile/contact-us/request.dto';
import { RepositoryError } from '../../utils/customError';
import { COLLECTIONS } from '../../utils/enum';
import { Admin } from '../../models/v1/admin.model';
const { Types: { ObjectId } } = mongoose;

export default class UserRepository implements IUserRepository {
  readonly userModel: Model<IUser>;
  readonly deSerializer: JsonSerializer;
  readonly planModel: Model<any>;
  readonly adminModel: Model<any>;

  constructor() {
    this.userModel = User;
    this.planModel = Plan;
    this.adminModel = Admin;
    this.deSerializer = new JsonSerializer({
      nullishPolicy: {
        undefined: 'remove',
        null: 'remove',
      },
    });
  }

  /**
   * Creates a new user in the database
   * @param userData - User data to be saved
   * @returns Promise resolving to the created user DTO
   */
  async create(userData: UserDTO): Promise<UserDTO> {
    const user = new this.userModel(userData);
    const savedUser = await user.save();
    return savedUser.toObject({ getters: true }) as UserDTO;
  }

  /**
   * Finds a user by their email address
   * @param email - Email address to search for
   * @returns Promise resolving to the user DTO or empty array if not found
   */
  async findByEmail(email: string): Promise<UserDTO | []> {
    const userDetails = await this.userModel.findOne({ email: email }).exec();
    if (userDetails) {
      const user = this.deSerializer.deserializeObject(userDetails, UserDTO);
      return user!;
    }
    return [];
  }

  /**
   * Finds an admin user by their email address
   * @param email - Email address to search for
   * @returns Promise resolving to the admin user DTO or empty array if not found
   */
  async findAdminByEmail(email: string): Promise<UserDTO | []> {
    const userDetails = await this.adminModel.findOne({ email: email }).exec();
    if (userDetails) {
      return userDetails;
    }
    return [];
  }

  /**
   * Finds a user by their ID
   * @param userID - User ID to search for
   * @returns Promise resolving to the user object or empty array if not found
   */
  async findByID(userID: string): Promise<any> {
    let userDetails;
    userDetails = await this.userModel.findById(userID).exec();
    if (userDetails) {
      return userDetails;
    }
    return [];
  }

  /**
   * Updates a user's password
   * @param userID - ID of the user to update
   * @param password - New password to set
   * @returns Promise resolving to the update result
   */
  async updatePassword(userID: string, password: string): Promise<any> {
    const user = await this.userModel.updateOne(
      { _id: userID },
      { password: password },
    );
    return user;
  }

  /**
   * Creates a new feedback entry in the database
   * @param feedback - Feedback data to be saved
   * @returns Promise resolving to void
   * @throws Error if feedback creation fails
   */
  async createFeedback(feedback: ContactUsDTO): Promise<any> {
    try {
      const contact = new Contact(feedback);
      await contact.save();
    } catch (error) {
      throw error;
    }
  }

  /**
   * Updates user data by email
   * @param userData - Updated user data
   * @returns Promise resolving to boolean indicating success
   * @throws RepositoryError if update fails
   */
  async updateUserByEmail(userData: UserDTO) {
    let response = false;
    try {
      const file = await this.userModel.updateOne(
        { email: userData.email },
        { $set: userData },
      );
      if (file) {
        response = true;
      }
      return response;
    } catch (error) {
      throw new RepositoryError('Internal Server Error', 500);
    }
  }

  /**
   * Updates user profile information
   * @param userID - ID of the user to update
   * @param userData - Updated profile data
   * @returns Promise resolving to the update result
   * @throws Error if update fails
   */
  async updateProfile(
    userID: string,
    userData: UpdateUserProfileRequestDTO,
  ): Promise<any> {
    try {
      const user = await this.userModel.updateOne(
        {
          _id: userID,
        },
        {
          $set: userData,
        },
      );
      return user;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Retrieves user's plan information including storage and subscription details
   * @param storagePlan - Storage plan ID
   * @param subscriptionPlan - Subscription plan ID
   * @param createdAt - User creation date
   * @returns Promise resolving to plan details object
   * @throws Error if plan retrieval fails
   */
  async getPlan(
    storagePlan: any,
    subscriptionPlan: any,
    createdAt: any,
  ): Promise<any> {
    try {
      const storageCollection =
        mongoose.connection.db.collection(COLLECTIONS.names.STORAGE_PLANS);
      let storage = null;
      let subscription: any = null;
      let totalStorage = 0;
      let dueDate = null;
      if (storagePlan) {
        let objectId = new ObjectId(storagePlan);
        storage = await storageCollection.findOne({ _id: objectId });
        totalStorage += storage?.storage;
      }
      if (subscriptionPlan) {
        let objectId = new ObjectId(subscriptionPlan);
        subscription = await this.planModel.findOne({ _id: objectId });
      } else {
        const createdAtDate: any = new Date(createdAt);
        const currentDate: any = new Date();
        const diffInMs = currentDate - createdAtDate;
        const diffInDays = diffInMs / (1000 * 60 * 60 * 24);
        if (diffInDays < 14) {
          dueDate = new Date(
            createdAtDate.getTime() + 14 * 24 * 60 * 60 * 1000,
          );
          subscription = await this.planModel.findOne({ planName: COLLECTIONS.plans.FREEMIUM });
        }
      }
      if (subscription) {
        totalStorage += subscription.storage;
      }
      return { storage, subscription, totalStorage, dueDate };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Calculates total storage used by a user
   * @param userId - ID of the user
   * @returns Promise resolving to total storage used in MB
   * @throws Error if calculation fails
   */
  async calculateTotalStorageUsed(userId: any) {
    try {
      const filesCollection = mongoose.connection.db.collection(COLLECTIONS.names.FILES);
      const canvasCollection = mongoose.connection.db.collection(COLLECTIONS.names.CANVAS);

      const userFiles = await filesCollection
        .find({ userID: new mongoose.Types.ObjectId(userId) })
        .toArray();

      let totalStorageUsed = 0;

      for (let file of userFiles) {
        if (file.link) {
        } else {
          const fileCanvases = await canvasCollection
            .find({ fileID: file._id.toString() })
            .toArray();

          for (let canvas of fileCanvases) {
            totalStorageUsed += 0.5;
          }
        }
      }
      return totalStorageUsed;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  /**
   * Updates user's subscription plan
   * @param userID - ID of the user
   * @param type - Type of plan (storage or subscription)
   * @param planName - Name of the plan to update to
   * @returns Promise resolving to the update result
   * @throws Error if plan update fails
   */
  async updateUserSubscription(
    userID: string,
    type: any,
    planName: any
  ): Promise<any> {
    try {
      let plan: any = null;
      if (type == COLLECTIONS.planFields.STORAGE) {
        const storagePlansCollection = mongoose.connection.db.collection(
          COLLECTIONS.names.STORAGE_PLANS,
        );
        plan = await storagePlansCollection.findOne({
          appleProductId: planName,
        });
      }
      else if( type == COLLECTIONS.planFields.SUBSCRIPTION){
        plan = await this.planModel.findOne({ apple_product_id: planName, });
      }

      if (!plan) {
        throw new Error(COLLECTIONS.FAILURE.PLAN_NOT_FOUND);
      }
      const updateData = { [type]: new mongoose.Types.ObjectId(plan._id) };
      const user = await this.userModel.updateOne(
        {
          _id: userID,
        },
        { $set: updateData },
      );
      return user;
    } catch (error) {
      throw error;
    }
  }
}
