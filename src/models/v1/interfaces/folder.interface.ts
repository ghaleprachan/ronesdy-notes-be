import mongoose, { Document } from 'mongoose';

export interface IFolder extends Document {
  folderName: string;
  localFolderID: string
  userID: mongoose.Types.ObjectId;
  updatedAt: string;
  createdAt: string;
  isDeleted: boolean;
}
