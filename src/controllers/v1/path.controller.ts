/**
 * Path Controller
 * Handles all operations related to file and folder management.
 * Implements business logic for file operations, folder operations, and recycle bin functionality.
 */

import { NextFunction, Request, Response } from 'express';
import PathRepository from '../../repositories/v1/path.repository';
import {
  CreateFileRequestDTO,
  CreateFileResponseDTO,
  CreateFolderRequestDTO,
  CreateFolderResponseDTO,
  RenameFileRequestDTO,
  RenameFileResponseDTO,
  RenameFolderResponseDTO,
  RenameFolderRequestDTO,
  GetAllPathsResponseDTO,
  GetCanvasResponseDTO,
  GetRecycleBinResponseDTO,
} from '../../dto/v1/path';
import { FileDTO, CanvasDTO } from '../../dto/v1/common';
import { RepositoryError } from '../../utils/customError';
import {
  ForbiddenError,
  InternalServerError,
  NotFoundError,
  ValidationError,
} from '../../middleware/errorHandlingMiddleware';
import { deserializeToDTO } from '../../utils/deserializer';
import { StatusCodes } from 'http-status-codes';
import { CONTROLLERS, PATH_CONTROLLER } from '../../utils/enum';
import AWSStorage from '../../services/aws/aws.storage';
import jwt from 'jsonwebtoken';
import config from '../../config';
import pdf from 'pdf-parse';
import { getUserIDFromJWT } from '../../utils/decodeJWT';
const JWT_SECRET = config.JWT_SECRET!;

export default class PathController {
  public readonly pathRepository: PathRepository;
  public readonly AWSStorage: AWSStorage;

  constructor() {
    this.pathRepository = new PathRepository();
    this.AWSStorage = new AWSStorage();
  }

  /**
   * Retrieves a file and its associated canvases by file ID
   * @param req - Express request object containing file ID
   * @param res - Express response object
   * @param next - Express next function for error handling
   * @throws {NotFoundError} If file not found
   * @throws {InternalServerError} For any other server errors
   */
  async getFileByFileID(req: Request, res: Response, next: NextFunction) {
    const fileID = req.params.id;
    const userID = req.body.userID;
    let response;
    try {
      // await this.validateFileAccess(fileID!, userID, next);

      const canvases = await this.pathRepository.getCanvasByFileID(fileID);
      const file = await this.pathRepository.getFileByFileID(fileID);

      response = new GetCanvasResponseDTO(file, canvases, userID);

      res.status(StatusCodes.OK).json({
        success: true,
        message: PATH_CONTROLLER.SUCCESS.FILE_FETCHED,
        response,
      });
    } catch (error) {
      this.handleError(error, next);
    }
  }

  /**
   * Retrieves all files and folders for a user
   * @param req - Express request object containing user ID
   * @param res - Express response object
   * @param next - Express next function for error handling
   * @throws {NotFoundError} If no files or folders found
   * @throws {InternalServerError} For any other server errors
   */
  async getAllPathsByUserID(req: Request, res: Response, next: NextFunction) {
    const userID = req.body.userID;
    try {
      const paths = await this.pathRepository.getAllPathsByUserID(userID);

      if (paths!) {
        const response = deserializeToDTO(paths, GetAllPathsResponseDTO);
        res.status(StatusCodes.OK).json({
          success: true,
          message: PATH_CONTROLLER.SUCCESS.FOLDERS_AND_FILES_FETCHED,
          response,
        });
        return;
      }

      next(
        new NotFoundError(
          PATH_CONTROLLER.VALIDATION.FILES_AND_FOLDERS_NOT_FOUND,
          CONTROLLERS.PATH_CONTROLLER,
        ),
      );
      return;
    } catch (error) {
      this.handleError(error, next);
    }
  }

  /**
   * Deletes a file by its ID
   * @param req - Express request object containing file ID
   * @param res - Express response object
   * @param next - Express next function for error handling
   * @throws {ForbiddenError} If user doesn't have access to the file
   * @throws {InternalServerError} For any other server errors
   */
  async deleteFileByFileID(req: Request, res: Response, next: NextFunction) {
    const fileID = req.params.id;
    const userID = req.body.userID;
    try {
      await this.validateFileAccess(fileID!, userID, next);
      let file = await this.pathRepository.getFileByFileID(fileID);
      await this.pathRepository.deleteFileByFileID(fileID);

      if(file.link != undefined && file.link != null){
        let key = 'userFiles/'+userID+'/'+file.fileName;
        let deleteResponse = this.AWSStorage.deleteFile(key);
      }

      res
        .status(StatusCodes.NO_CONTENT)
        .json({ message: PATH_CONTROLLER.SUCCESS.FILE_DELETED });
    } catch (error) {
      this.handleError(error, next);
    }
  }

  /**
   * Creates a new file with associated canvases
   * @param req - Express request object containing file data
   * @param res - Express response object
   * @param next - Express next function for error handling
   * @throws {ForbiddenError} If user doesn't have access to the folder
   * @throws {InternalServerError} For any other server errors
   */
  async createFile(req: Request, res: Response, next: NextFunction) {
    const userID = req.body.userID;
    try {
      let request = deserializeToDTO(req.body, CreateFileRequestDTO);
      this.validateFolderAccess(request.folderID, userID, next);

      const fileRequest = new FileDTO(request!, userID);
      const createdFile = await this.createFileEntry(fileRequest);
      const arrayOfCanvases = await this.createCanvasesForFile(
        request?.file?.canvas,
        createdFile._id,
      );

      const response = new CreateFileResponseDTO(createdFile, arrayOfCanvases!);
      res.status(StatusCodes.CREATED).json({
        success: true,
        message: PATH_CONTROLLER.SUCCESS.FILE_CREATED,
        response,
      });
    } catch (error) {
      this.handleError(error, next);
    }
  }

  /**
   * Creates a new folder
   * @param req - Express request object containing folder data
   * @param res - Express response object
   * @param next - Express next function for error handling
   * @throws {InternalServerError} For any server errors
   */
  async createFolder(req: Request, res: Response, next: NextFunction) {
    const userID = req.body.userID;
    try {
      let request = deserializeToDTO(req.body, CreateFolderRequestDTO);
      request!.userID = userID;

      const data = await this.pathRepository.createFolder(request!);
      const response = deserializeToDTO(data!, CreateFolderResponseDTO);

      res.status(StatusCodes.CREATED).json({
        success: true,
        message: PATH_CONTROLLER.SUCCESS.FOLDER_CREATED,
        response,
      });
    } catch (error) {
      this.handleError(error, next);
    }
  }

  /**
   * Renames an existing folder
   * @param req - Express request object containing folder data
   * @param res - Express response object
   * @param next - Express next function for error handling
   * @throws {ForbiddenError} If user doesn't have access to the folder
   * @throws {InternalServerError} For any other server errors
   */
  async renameFolder(req: Request, res: Response, next: NextFunction) {
    const userID = req.body.userID;
    try {
      let request = deserializeToDTO(req.body, RenameFolderRequestDTO);
      request!.userID = userID;
      await this.validateFolderAccess(request!.folderID, userID, next);

      const data = await this.pathRepository.renameFolder(request!);

      const response = new RenameFolderResponseDTO(
        request?.folderID!,
        request?.folderName!,
        data.acknowledged,
        data.updatedAt,
      );
      res.status(StatusCodes.OK).json({
        success: true,
        message: PATH_CONTROLLER.SUCCESS.FOLDER_UPDATED,
        response,
      });
    } catch (error) {
      this.handleError(error, next);
    }
  }

  /**
   * Deletes a folder by its ID
   * @param req - Express request object containing folder ID
   * @param res - Express response object
   * @param next - Express next function for error handling
   * @throws {ForbiddenError} If user doesn't have access to the folder
   * @throws {InternalServerError} For any other server errors
   */
  async deleteFolderByFolderID(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    const userID = req.body.userID;
    const folderID = req.params.id;
    try {
      await this.validateFolderAccess(folderID, userID, next);

      await this.pathRepository.deleteFolderByFolderID(folderID);

      res.status(StatusCodes.NO_CONTENT).json({
        success: true,
        message: PATH_CONTROLLER.SUCCESS.FOLDER_DELETED,
      });
    } catch (error) {
      this.handleError(error, next);
    }
  }

  /**
   * Renames a file
   * @param req - Express request object containing file data
   * @param res - Express response object
   * @param next - Express next function for error handling
   * @throws {ForbiddenError} If user doesn't have access to the file
   * @throws {InternalServerError} For any other server errors
   */
  async renameFile(req: Request, res: Response, next: NextFunction) {
    const userID = req.body.userID;
    try {
      let request = deserializeToDTO(req.body, RenameFileRequestDTO);
      request!.userID = userID;
      await this.validateFileAccess(request!.fileID, userID, next);

      const data = await this.pathRepository.updateFile(request!);

      const response = new RenameFileResponseDTO(
        request,
        data.acknowledged,
        data.updatedAt,
      );
      res.status(StatusCodes.OK).json({
        success: true,
        message: PATH_CONTROLLER.SUCCESS.FILE_UPDATED,
        response,
      });
    } catch (error) {
      this.handleError(error, next);
    }
  }

  async recycleBin(req: Request, res: Response, next: NextFunction) {
    const userID = req.body.userID;
    try {
      const data = await this.pathRepository.getRecycleBin(userID);
      const { files, folders } = data;
      const result = {
        folder: folders.map((folder) => ({
          folderID: folder._id.toString(),
          folderName: folder.folderName,
          createdAt: folder.createdAt,
          updatedAt: folder.updatedAt,
        })),
        file: files
          .filter((file) => {
            if (file.folderID && folders.length > 0) {
              const response = folders.some((folder) => {
                if (
                  folder._id.toString() === file.folderID.toString() &&
                  folder.isDeleted
                ) {
                  return false;
                }
              });
              return response;
            } else if (file.isDeleted && !file.folderID) {
              return true;
            } else {
              return true;
            }
          })
          .map((file) => ({
            fileName: file.fileName,
            _id: file._id.toString(),
            isFavorite: file.isFavorite,
            createdAt: file.createdAt,
            updatedAt: file.updatedAt,
          })),
      };
      const response = deserializeToDTO(result, GetRecycleBinResponseDTO);
      res.status(StatusCodes.OK).json({
        success: true,
        message: PATH_CONTROLLER.SUCCESS.FOLDERS_AND_FILES_FETCHED,
        response,
      });
    } catch (error) {
      this.handleError(error, next);
    }
  }

  /**
   * Recovers all deleted items from the recycle bin
   * @param req - Express request object containing user ID
   * @param res - Express response object
   * @param next - Express next function for error handling
   * @throws {InternalServerError} For any server errors
   */
  async recoverAll(req: Request, res: Response, next: NextFunction) {
    const userID = req.body.userID;
    try {
      await this.pathRepository.recoverAll(userID);

      res.status(StatusCodes.NO_CONTENT).json({
        success: true,
        message: PATH_CONTROLLER.SUCCESS.FILES_AND_FOLDERS_RESTORED,
      });
    } catch (error) {
      this.handleError(error, next);
    }
  }

  /**
   * Moves an item to the recycle bin
   * @param req - Express request object containing item ID and type
   * @param res - Express response object
   * @param next - Express next function for error handling
   * @throws {ValidationError} If parameters are incorrect
   * @throws {ForbiddenError} If user doesn't have access to the item
   * @throws {InternalServerError} For any server errors
   */
  async moveToRecycleBin(req: Request, res: Response, next: NextFunction) {
    const userID = req.body.userID;
    const id = req.query.id as string;
    const type = req.query.type;
    try {
      if (id && (type === '1' || type === '2')) {
        if (type === '1') {
          await this.validateFolderAccess(id, userID, next);

          const response = await this.pathRepository.softDeleteFolder(id);
          res.status(StatusCodes.OK).json({
            success: true,
            message: PATH_CONTROLLER.SUCCESS.FOLDER_MOVED_TO_RECYCLE,
            response,
          });
        } else {
          await this.validateFileAccess(id, userID, next);

          const response = await this.pathRepository.softDeleteFile(id);
          res.status(StatusCodes.OK).json({
            success: true,
            message: PATH_CONTROLLER.SUCCESS.FILE_MOVED_TO_RECYCLE,
            response,
          });
        }
      } else {
        next(
          new ValidationError(
            PATH_CONTROLLER.VALIDATION.INCORRECT_PARAMETERS,
            CONTROLLERS.PATH_CONTROLLER,
          ),
        );
        return;
      }
    } catch (error) {
      this.handleError(error, next);
    }
  }

  /**
   * Permanently deletes all items in the recycle bin
   * @param req - Express request object containing user ID
   * @param res - Express response object
   * @param next - Express next function for error handling
   * @throws {InternalServerError} For any server errors
   */
  async emptyBin(req: Request, res: Response, next: NextFunction) {
    const userID = req.body.userID;
    try {
      await this.pathRepository.hardDeleteAll(userID);

      res.status(StatusCodes.NO_CONTENT).json({
        success: true,
        message: PATH_CONTROLLER.SUCCESS.BIN_EMPTIED,
      });
    } catch (error) {
      this.handleError(error, next);
    }
  }

  /**
   * Recovers a single item from the recycle bin
   * @param req - Express request object containing item ID and type
   * @param res - Express response object
   * @param next - Express next function for error handling
   * @throws {ValidationError} If parameters are incorrect
   * @throws {ForbiddenError} If user doesn't have access to the item
   * @throws {InternalServerError} For any server errors
   */
  async recover(req: Request, res: Response, next: NextFunction) {
    const userID = req.body.userID;
    const id = String(req.query.id);
    const type = req.query.type;
    try {
      if (id && (type === '1' || type === '2')) {
        if (type === '1') {
          await this.validateFolderAccess(id, userID, next);

          await this.pathRepository.recoverFolder(id);
          res.status(StatusCodes.NO_CONTENT).json({
            success: true,
            message: PATH_CONTROLLER.SUCCESS.FOLDER_RESTORED,
          });
        } else {
          await this.validateFileAccess(id, userID, next);

          await this.pathRepository.recoverFile(id);
          res.status(StatusCodes.NO_CONTENT).json({
            success: true,
            message: PATH_CONTROLLER.SUCCESS.FILE_RESTORED,
          });
        }
      } else {
        next(
          new ValidationError(
            PATH_CONTROLLER.VALIDATION.INCORRECT_PARAMETERS,
            CONTROLLERS.PATH_CONTROLLER,
          ),
        );
        return;
      }
    } catch (error) {
      this.handleError(error, next);
    }
  }

  /**
   * Gets user storage information
   * @param req - Express request object containing user ID
   * @param res - Express response object
   * @param next - Express next function for error handling
   * @throws {InternalServerError} For any server errors
   */
  async getUserStorage(req: Request, res: Response, next: NextFunction) {
    const userID = req.body.userID;
    try {
      const response = await this.pathRepository.getUserStorage(userID);
      console.log(response);
    } catch (error) {
      next(new InternalServerError());
    }
  }

  async createFileEntry(fileRequest: FileDTO): Promise<any> {
    return this.pathRepository.createFile(fileRequest);
  }

  async createCanvasesForFile(
    canvases: CanvasDTO[] | undefined,
    fileID: string,
  ): Promise<CanvasDTO[]> {
    const arrayOfCanvases: CanvasDTO[] = [];

    if (canvases) {
      for await (const element of canvases) {
        element.fileID = fileID;
        const createdCanvas = await this.pathRepository.createCanvas(element!);
        const canvasDTO = deserializeToDTO(createdCanvas, CanvasDTO);
        arrayOfCanvases.push(canvasDTO!);
      }
    }

    return arrayOfCanvases;
  }

  /**
   * Uploads a file to S3 storage
   * @param req - Express request object containing file data
   * @param res - Express response object
   * @param next - Express next function for error handling
   * @throws {InternalServerError} For any server errors
   */
  async uploadFileToS3(req: Request, res: Response, next: NextFunction) {
    try {
      let userID = getUserIDFromJWT(req);
      let file = req.file;
      let key = `userFiles/${userID}/${file?.originalname}`;
      let folderID = req.body.folderID;
      if (file) {
        const pdfBuffer = file.buffer;
        let numOfPages: any;
        await pdf(pdfBuffer).then((data) => {
          numOfPages = data.numpages;
        });
        const awsresponse: any = await this.AWSStorage.uploadToS3(file, key);
        if (awsresponse.Location) {
          let body: any = {
            file: {
              fileName: file.originalname,
              canvas: Array.from({ length: numOfPages }, (_, i) => ({ pageNo: i + 1 })),
              link: awsresponse.Location,
            },
          };
          if (folderID && folderID != 'null') {
            body.folderID = folderID;
          }
          let request = deserializeToDTO(body, CreateFileRequestDTO);

          const fileRequest = new FileDTO(request!, userID);
          const createdFile = await this.createFileEntry(fileRequest);
          const arrayOfCanvases = await this.createCanvasesForFile(
            request?.file?.canvas,
            createdFile._id,
          );

          const response = new CreateFileResponseDTO(createdFile, arrayOfCanvases);
          res.status(StatusCodes.CREATED).json({
            success: true,
            message: PATH_CONTROLLER.SUCCESS.FILE_CREATED,
            response,
          });
        }
        return null;
      }
    } catch (error) {
      this.handleError(error, next);
    }
  }

  async validateFolderAccess(
    folderID: string | undefined,
    userID: string,
    next: NextFunction,
  ) {
    if (
      folderID &&
      !(await this.pathRepository.isFolderOwnedByUser(folderID, userID))
    ) {
      next(
        new ForbiddenError(
          PATH_CONTROLLER.VALIDATION.NO_ACCESS_FOLDER,
          CONTROLLERS.PATH_CONTROLLER,
        ),
      );
      return;
    }
  }

  async validateFileAccess(
    fileID: string | undefined,
    userID: string,
    next: NextFunction,
  ) {
    if (
      fileID &&
      !(await this.pathRepository.isFileOwnedByUser(fileID, userID))
    ) {
      next(
        new ForbiddenError(
          PATH_CONTROLLER.VALIDATION.NO_ACCESS_FILE,
          CONTROLLERS.PATH_CONTROLLER,
        ),
      );
      return;
    }
  }

  handleError(error: any, next: NextFunction) {
    if (error instanceof RepositoryError && error.statusCode === 500) {
      next(new InternalServerError(error.message));
    } else {
      next(new InternalServerError());
    }
  }
}
