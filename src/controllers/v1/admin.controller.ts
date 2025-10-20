import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { InternalServerError } from '../../middleware/errorHandlingMiddleware';
import AdminRepository from '../../repositories/v1/admin.repository';
import { ADMIN_CONTROLLER, PATH_CONTROLLER } from '../../utils/enum';
import PathRepository from '../../repositories/v1/path.repository';
import { GetCanvasResponseDTO } from '../../dto/v1/path';

export default class AdminController {
  public readonly adminRepository: AdminRepository;
  public readonly pathRepository: PathRepository;

  constructor() {
    this.adminRepository = new AdminRepository();
    this.pathRepository = new PathRepository();
  }

  async getDashboard(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<any> {
    try {
      const users = await this.adminRepository.getTotalUsersCount();
      const pendingRequests =
        await this.adminRepository.getPendingRequestsCount();
      res.status(StatusCodes.OK).json({
        success: true,
        message: ADMIN_CONTROLLER.SUCCESS.DASHBOARD_FETCHED,
        users,
        pendingRequests,
      });
    } catch (error) {
      next(new InternalServerError());
    }
  }

  async getAllRequests(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<any> {
    const { page = 1, limit = 10, status } = req.query;

    const pageNumber = parseInt(page as string);
    const limitNumber = parseInt(limit as string);
    try {
      const requests = await this.adminRepository.getAllRequests(
        pageNumber,
        limitNumber,
        status as string | undefined,
      );
      res.status(StatusCodes.OK).json({
        success: true,
        message: ADMIN_CONTROLLER.SUCCESS.REQUESTS_FETCHED,
        requests: requests.data,
        currentPage: pageNumber,
        totalPages: Math.ceil(requests.total / limitNumber),
        totalItems: requests.total,
        perPage: limitNumber,
      });
    } catch (error) {
      next(new InternalServerError());
    }
  }

  async updateRequest(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<any> {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          message: ADMIN_CONTROLLER.VALIDATION.NO_STATUS_PROVIDED,
        });
      }

      const updatedDocument = await this.adminRepository.updaterequestStatus(id, status);

      if (!updatedDocument) {
        return res.status(StatusCodes.NOT_FOUND).json({
          success: false,
          message: ADMIN_CONTROLLER.FAILURE.REQUEST_NOT_FOUND,
        });
      }
  
      res.status(StatusCodes.OK).json({
        success: true,
        message: ADMIN_CONTROLLER.SUCCESS.STATUS_UPDATED,
        data: updatedDocument,
      });
    } catch (error) {
      next(new InternalServerError());
    }
  }

  async getFileByFileID(req: Request, res: Response, next: NextFunction) {
    const fileID = req.params.id;
    const userID = req.body.userID;
    let response;
    try {

      const canvases = await this.pathRepository.getCanvasByFileID(fileID);
      const file = await this.pathRepository.getFileByFileID(fileID);

      response = new GetCanvasResponseDTO(file, canvases, userID);

      res.status(StatusCodes.OK).json({
        success: true,
        message: PATH_CONTROLLER.SUCCESS.FILE_FETCHED,
        response,
      });
    } catch (error) {
      next(new InternalServerError());
    }
  }
 
  async getAllUsers(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<any> {
    const { page = 1, limit = 10 } = req.query;

    const pageNumber = parseInt(page as string);
    const limitNumber = parseInt(limit as string);
    try {
      const users = await this.adminRepository.getAllUsers(pageNumber, limitNumber);
      res.status(StatusCodes.OK).json({
        success: true,
        message: ADMIN_CONTROLLER.SUCCESS.USERS_FETCHED,
        users: users.users,
        currentPage: pageNumber,
        totalPages: Math.ceil(users.total / limitNumber),
        totalItems: users.total,
        perPage: limitNumber,
      });
    } catch (error) {
      next(new InternalServerError());
    }
  }

  async getAllAdmins(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<any> {
    const { page = 1, limit = 10 } = req.query;

    const pageNumber = parseInt(page as string);
    const limitNumber = parseInt(limit as string);
    try {
      const users = await this.adminRepository.getAllAdmins(pageNumber, limitNumber);
      res.status(StatusCodes.OK).json({
        success: true,
        message: ADMIN_CONTROLLER.SUCCESS.ADMINS_FETCHED,
        users: users.users,
        currentPage: pageNumber,
        totalPages: Math.ceil(users.total / limitNumber),
        totalItems: users.total,
        perPage: limitNumber,
      });
    } catch (error) {
      next(new InternalServerError());
    }
  }

  async updateUser(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<any> {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          message: ADMIN_CONTROLLER.VALIDATION.NO_STATUS_PROVIDED,
        });
      }

      const updatedDocument = await this.adminRepository.updateUserStatus(id, status);

      if (!updatedDocument) {
        return res.status(StatusCodes.NOT_FOUND).json({
          success: false,
          message: ADMIN_CONTROLLER.FAILURE.USER_NOT_FOUND,
        });
      }
  
      res.status(StatusCodes.OK).json({
        success: true,
        message: ADMIN_CONTROLLER.SUCCESS.USER_UPDATED,
        data: updatedDocument,
      });
    } catch (error) {
      next(new InternalServerError());
    }
  }

  async deleteAdmin(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<any> {
    const { id } = req.params;

    try {
      const deletedAdmin = await this.adminRepository.deleteAdmin(id);
      res.status(StatusCodes.OK).json({
        success: true,
        message: ADMIN_CONTROLLER.SUCCESS.ADMIN_DELETED,
      });
    } catch (error) {
      next(new InternalServerError());
    }
  }

  async addAdmin(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<any> {
    const { firstName, lastName, email, password } = req.body;

    try {
      const addedAdmin = await this.adminRepository.addAdmin(firstName, lastName, email, password);
      res.status(StatusCodes.OK).json({
        success: true,
        message: ADMIN_CONTROLLER.SUCCESS.ADMIN_ADDED,
        addedAdmin
      });
    } catch (error) {
      next(new InternalServerError());
    }
  }
}
