import { Admin } from '../../models/v1/admin.model';
import { MarketplaceFile } from '../../models/v1/marketplace.model';
import { User } from '../../models/v1/user.model';
import { MARKETPLACE_CONTROLLER } from '../../utils/enum';

export default class AdminRepository {
  async getTotalUsersCount(): Promise<number> {
    const userCount = await User.countDocuments().exec();
    return userCount;
  }

  async getAllUsers(page: any, limit: any): Promise<any> {
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find({ admin: { $ne: true } })
        .skip(skip)
        .limit(limit)
        .exec(),
      User.countDocuments({ admin: { $ne: true } }).exec(),
    ]);
    return { users, total };
  }

  async updateUserStatus(id: string, status: string): Promise<any> {
    const users = await User.findByIdAndUpdate(
      id,
      {
        $set: { status },
      },
      {
        new: true,
      },
    ).exec();
    return users;
  }

  async getPendingRequestsCount(): Promise<any> {
    const pendingCount = await MarketplaceFile.countDocuments({
      status: MARKETPLACE_CONTROLLER.STATUS.PENDING,
    }).exec();
    return pendingCount;
  }

  async getAllRequests(
    page: number,
    limit: number,
    status?: string,
  ): Promise<any> {
    const skip = (page - 1) * limit;
    let query: any = {};

    if (status) {
      query.status = status;
    }
    const [data, total] = await Promise.all([
      MarketplaceFile.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),

      MarketplaceFile.countDocuments(query).exec(),
    ]);

    return { data, total };
  }

  async updaterequestStatus(id: string, status: string): Promise<any | null> {
    return MarketplaceFile.findByIdAndUpdate(
      id,
      {
        $set: { status },
      },
      {
        new: true,
      },
    ).exec();
  }

  async getAllAdmins(page: any, limit: any): Promise<any | null> {
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      Admin.find({ superAdmin: { $ne: true } })
        .skip(skip)
        .limit(limit)
        .exec(),
      Admin.countDocuments({ superAdmin: { $ne: true } }).exec(),
    ]);
    return { users, total };
  }

  async deleteAdmin(id: any): Promise<any | null> {
    const deletedAdmin = Admin.findByIdAndDelete(id);
    return deletedAdmin;
  }

  async addAdmin(
    firstName: any,
    lastName: any,
    email: any,
    password: any,
  ): Promise<any | null> {
    const newAdmin = new Admin({
      firstName,
      lastName,
      email,
      password,
    });
    const savedAdmin = await newAdmin.save();

    return savedAdmin;
  }
}
