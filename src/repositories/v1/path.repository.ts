import { Model } from 'mongoose';
import { IPathRepository } from '../../repositories/v1/interfaces/path.interface';
import { IFile } from '../../models/v1/interfaces/file.interface';
import { File } from '../../models/v1/file.model';
import { JsonSerializer } from 'typescript-json-serializer';
import { ICanvas } from '../../models/v1/interfaces/canvas.interface';
import { Canvas } from '../../models/v1/canvas.model';
import { IFolder } from '../../models/v1/interfaces/folder.interface';
import { Folder } from '../../models/v1/folder.model';
import { RenameFileRequestDTO, CreateFolderRequestDTO, RenameFolderRequestDTO } from '../../dto/v1/path';
import { FileDTO } from '../../dto/v1/common/file.dto';
import { CanvasDTO } from '../../dto/v1/common/canvas.dto';
import { FolderDTO } from '../../dto/v1/common/folder.dto';
import { IUser, User } from '../../models/v1/user.model';
import { RepositoryError } from '../../utils/customError';

export default class PathRepository implements IPathRepository {
  private readonly fileModel: Model<IFile>;
  private readonly folderModel: Model<IFolder>;
  private readonly canvasModel: Model<ICanvas>;
  private readonly userModel: Model<IUser>;
  readonly deSerializer: JsonSerializer;

  constructor() {
    this.fileModel = File;
    this.folderModel = Folder;
    this.canvasModel = Canvas;
    this.userModel = User;
    this.deSerializer = new JsonSerializer({
      nullishPolicy: {
        undefined: 'remove',
        null: 'remove',
      },
    });
  }

  async getAllPathsByUserID(userID: string): Promise<any> {
    try {
      const folders = await this.folderModel.find<IFolder>({
        userID: userID,
        isDeleted: false,
      });
      const files = await this.fileModel.find<IFile>({
        userID: userID,
        isDeleted: false,
      });

      const canvases = await this.getThumbnailPreview(files);

      if (!files && !folders) {
        return [];
      }
      const result = {
        folders: folders.map((folder) => ({
          folderID: folder._id.toString(),
          folderName: folder.folderName,
          createdAt: folder.createdAt,
          updatedAt: folder.updatedAt,
          localFolderID: folder?.localFolderID,
          files: files
            .filter((file) => file.folderID && file.folderID.equals(folder._id))
            .map((file) => ({
              canvas: canvases?.filter((obj) => {
                return obj.fileID === file._id.toString();
              }),
              fileName: file.fileName,
              isFavorite: file.isFavorite,
              _id: file._id.toString(),
              createdAt: file.createdAt,
              updatedAt: file.updatedAt,
              localFileID: file?.localFileID,
              fileTemplate: file.fileTemplate,
              link: file.link,
            })),
        })),
        files: files
          .filter((file) => !file.folderID)
          .map((file) => ({
            canvas: canvases?.filter((obj) => {
              return obj.fileID === file._id.toString();
            }),
            fileName: file.fileName,
            _id: file._id.toString(),
            isFavorite: file.isFavorite,
            createdAt: file.createdAt,
            updatedAt: file.updatedAt,
            localFileID: file?.localFileID,
            fileTemplate: file.fileTemplate,
            link: file.link
          })),
      };
      if (!result) {
        return [];
      }
      return result;
    } catch (error) {
      throw error;
    }
  }

  async deleteFileByFileID(fileID: string): Promise<boolean> {
    let isDeleted = false;
    try {
      await this.canvasModel.deleteMany({ fileID });
      const deletedFile = await this.fileModel.findOneAndRemove({
        _id: fileID,
      });

      if (deletedFile) {
        isDeleted = true;
      }
      return isDeleted;
    } catch (error) {
      throw new RepositoryError('Repository error', 500);
    }
  }

  async getCanvasByFileID(fileID: string): Promise<any> {
    try {
      const file = await this.fileModel.findById(fileID);
      if (!file) {
        return [];
      } else if (file!.isDeleted) {
        return [];
      }
      const canvases = await this.canvasModel.find({ fileID: file._id });

      return canvases;
    } catch (error) {
      throw new RepositoryError('Repository error', 500);
    }
  }

  async getFileByFileID(fileID: string): Promise<any> {
    let response;
    try {
      const file = await this.fileModel.findById(fileID);
      if (file) {
        response = this.deSerializer.deserializeObject(file!, FileDTO);
      }
      return response;
    } catch (error) {
      throw new RepositoryError('Repository error', 500);
    }
  }

  async getFolderByFolderID(folderID: string): Promise<any> {
    let response;
    try {
      const folder = await this.folderModel.findById(folderID);
      if (folder) {
        response = this.deSerializer.deserializeObject(folder!, FolderDTO);
      }
      return response;
    } catch (error) {
      throw new RepositoryError('Repository error', 500);
    }
  }

  async createFile(file: FileDTO | undefined): Promise<FileDTO> {
    try {
      const fileRequest = new this.fileModel(file);
      const createdFile = await fileRequest.save();
      const response = this.deSerializer.deserializeObject(
        createdFile,
        FileDTO,
      );
      return response!;
    } catch (error) {
      console.log(error);
      throw new RepositoryError('Repository error', 500);
    }
  }

  async createCanvas(canvas: CanvasDTO): Promise<ICanvas> {
    try {
      const savedCanvases: ICanvas = await this.canvasModel.create(canvas);
      return savedCanvases;
    } catch (error) {
      console.log(error);
      throw new RepositoryError('Repository error', 500);
    }
  }

  async createFolder(folderData: CreateFolderRequestDTO): Promise<FolderDTO> {
    try {
      const folder = await this.folderModel.create(folderData);
      const response = this.deSerializer.deserializeObject(folder, FolderDTO);
      return response!;
    } catch (error) {
      throw new RepositoryError('Repository error', 500);
    }
  }

  async renameFolder(folderData: RenameFolderRequestDTO): Promise<any> {
    try {
      const folder = await this.folderModel.updateOne(
        { _id: folderData.folderID },
        { $set: { folderName: folderData.folderName } },
      );
      return folder!;
    } catch (error) {
      throw new RepositoryError('Repository error', 500);
    }
  }

  async updateFile(fileData: RenameFileRequestDTO): Promise<any> {
    try {
      const data = {
        isFavorite: fileData?.isFavorite,
        fileName: fileData?.newFileName,
        folderID: fileData?.folderID,
        fileTemplate: fileData?.fileTemplate,
        lastCanvasTemplate: fileData?.lastCanvasTemplate,
      };
      const file = await this.fileModel.updateOne(
        { _id: fileData.fileID },
        { $set: data },
      );
      return file!;
    } catch (error) {
      throw new RepositoryError('Repository error', 500);
    }
  }

  async deleteFolderByFolderID(folderID: string): Promise<boolean> {
    try {
      let response = false;
      const filesToDelete = await File.find({ folderID: folderID });
      const fileIDsToDelete = filesToDelete.map((file) => file._id);

      await Canvas.deleteMany({ fileID: { $in: fileIDsToDelete } });
      await File.deleteMany({ folderID: folderID });
      const deletedFolder = await Folder.findOneAndRemove({ _id: folderID });

      if (deletedFolder) {
        response = true;
      }
      return response;
    } catch (error) {
      throw new RepositoryError('Repository error', 500);
    }
  }

  async isFileOwnedByUser(fileID: string, userID: string): Promise<boolean> {
    let response = false;
    const file = await this.fileModel.findOne({
      _id: fileID,
      userID: userID,
    });
    if (file) {
      response = true;
    }
    return response;
  }

  async isFolderOwnedByUser(
    folderID: string,
    userID: string,
  ): Promise<boolean> {
    let response = false;
    const folder = await this.folderModel.findOne({
      _id: folderID,
      userID: userID,
    });
    if (folder) {
      response = true;
    }
    return response;
  }

  async softDeleteFile(fileID: string): Promise<boolean> {
    try {
      let response = false;
      const file = await this.fileModel.updateOne(
        { _id: fileID },
        { $set: { isDeleted: true } },
      );
      if (file) {
        response = true;
      }
      return response;
    } catch (error) {
      throw new RepositoryError('Internal Server Error', 500);
    }
  }

  async softDeleteFolder(folderID: string): Promise<boolean> {
    try {
      let response = false;
      const folder = await this.folderModel.updateOne(
        { _id: folderID },
        { $set: { isDeleted: true } },
      );

      const file = await this.fileModel.updateMany(
        { folderID: folderID },
        { $set: { isDeleted: true } },
      );
      if (folder) {
        response = true;
      }
      return response;
    } catch (error) {
      throw new RepositoryError('Internal Server Error', 500);
    }
  }

  async recoverAll(userID: string): Promise<boolean> {
    let response = false;
    try {
      const folder = await this.folderModel.updateMany(
        { userID: userID, isDeleted: true },
        { $set: { isDeleted: false } },
      );
      const file = await this.fileModel.updateMany(
        { userID: userID, isDeleted: true },
        { $set: { isDeleted: false } },
      );
      if (file && folder) {
        response = true;
      }
      return response;
    } catch (error) {
      throw new RepositoryError('Internal Server Error', 500);
    }
  }

  async recoverFile(fileID: string) {
    let response = false;
    try {
      const file = await this.fileModel.updateOne(
        { _id: fileID },
        { $set: { isDeleted: false } },
      );
      if (file) {
        response = true;
      }
      return response;
    } catch (error) {
      throw new RepositoryError('Internal Server Error', 500);
    }
  }

  async recoverFolder(folderID: string) {
    let response = false;
    try {
      const folder = await this.folderModel.updateOne(
        { _id: folderID },
        { $set: { isDeleted: false } },
      );

      const file = await this.fileModel.updateMany(
        { folderID: folderID },
        { $set: { isDeleted: false } },
      );

      if (folder) {
        response = true;
      }
      return response;
    } catch (error) {
      throw new RepositoryError('Internal Server Error', 500);
    }
  }

  async hardDeleteAll(userID: string): Promise<boolean> {
    let response = false;
    try {
      const filesToDelete = await this.fileModel.find({
        userID: userID,
        isDeleted: true,
      });

      if (filesToDelete.length > 0) {
        const fileIDsToDelete = filesToDelete.map((file) => file._id);
        const canvasDeletion = await this.canvasModel.deleteMany({
          fileID: { $in: fileIDsToDelete },
        });

        if (canvasDeletion.deletedCount > 0) {
          const folderDeletion = await this.folderModel.deleteMany({
            userID: userID,
            isDeleted: true,
          });
          const fileDeletion = await this.fileModel.deleteMany({
            userID: userID,
            isDeleted: true,
          });
          if (
            folderDeletion.deletedCount > 0 &&
            fileDeletion.deletedCount > 0
          ) {
            response = true;
          }
        }
      }
      return response;
    } catch (error) {
      throw new RepositoryError('Internal Server Error', 500);
    }
  }

  async getRecycleBin(userID: string) {
    try {
      const files = await this.fileModel.find({
        userID: userID,
        isDeleted: true,
      });
      const folders = await this.folderModel.find({
        userID: userID,
        isDeleted: true,
      });
      return { files, folders };
    } catch (error) {
      throw new RepositoryError('Internal Server Error', 500);
    }
  }

  async deleteAllUserData(userID: string): Promise<boolean> {
    try {
      let response = false;

      const filesToDelete = await this.fileModel.find({
        userID: userID,
      });

      if (filesToDelete.length > 0) {
        const fileIDsToDelete = filesToDelete.map((file) => file._id);
        const canvasDeletion = await this.canvasModel.deleteMany({
          fileID: { $in: fileIDsToDelete },
        });

        if (canvasDeletion.deletedCount > 0) {
          const folderDeletion = await this.folderModel.deleteMany({
            userID: userID
          });
          const fileDeletion = await this.fileModel.deleteMany({
            userID: userID,
          });

          if (
            folderDeletion.deletedCount > 0 &&
            fileDeletion.deletedCount > 0
          ) {
            response = true;
          }
        }
      }
      const userDeletion = await this.userModel.deleteOne({ _id: userID });
      return true;
    } catch (error) {
      throw new RepositoryError('Internal Server Error', 500);
    }
  }

  async getThumbnailPreview(files: IFile[]) {
    try {
      if (files && files.length > 0) {
        const fileIDsToDelete = files.map((file) => file._id);
        const canvas = await this.canvasModel.find({
          fileID: { $in: fileIDsToDelete },
          pageNo: 1,
        });
        return canvas;
      }
    } catch (error) {
      throw new RepositoryError('Internal Server Error', 500);
    }
  }

  async getUserStorage(userID: string): Promise<any> {
    const filesPipeline = [
      {
        $match: {
          userID: userID,
        },
      },
      {
        $lookup: {
          from: 'canvas',
          localField: '_id',
          foreignField: 'fileID',
          as: 'canvasDocs',
        },
      },
      {
        $project: {
          storageConsumed: {
            $sum: [{ $size: '$canvasDocs' }, '$storageSize'],
          },
        },
      },
    ];

    // Pipeline for 'folders' collection
    const foldersPipeline = [
      {
        $match: {
          userID: userID,
        },
      },
      {
        $project: {
          storageConsumed: '$storageSize', // Assuming 'storageSize' represents folder storage
        },
      },
    ];

    // Execute the pipelines and combine the results
    Promise.all([
      await this.fileModel.aggregate(filesPipeline),
      await this.folderModel.aggregate(foldersPipeline),
    ])
      .then(([filesResult, foldersResult]) => {
        const totalStorageConsumed =
          filesResult[0].storageConsumed + foldersResult[0].storageConsumed;
        console.log(
          'Total storage consumed by the user:',
          totalStorageConsumed,
          'bytes',
        );
      })
      .catch((err) => {
        console.error('Error calculating user storage:', err);
      });
  }
}
