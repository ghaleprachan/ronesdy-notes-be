import { CreateFolderRequestDTO } from '../../../dto/v1/path';
import { FileDTO } from '../../../dto/v1/common/file.dto';
import { FolderDTO } from '../../../dto/v1/common/folder.dto';
import { GetCanvasDTO } from '../../../dto/v1/canvas/id/GET/get-canvas.dto';

export interface IPathRepository {
  getCanvasByFileID(fileID: string): Promise<GetCanvasDTO>;
  deleteFileByFileID(fileID: string): Promise<boolean>;
  getAllPathsByUserID(userID: string): Promise<any>;
  getFileByFileID(fileID: string): Promise<FileDTO | []>;
  createFolder(folderData: CreateFolderRequestDTO): Promise<FolderDTO>;
}
