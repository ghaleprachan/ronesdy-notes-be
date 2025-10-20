import mongoose, { Document } from 'mongoose';

export interface IFile extends Document {
  fileName: string;
  localFileID: string
  folderID: mongoose.Types.ObjectId;
  userID: mongoose.Types.ObjectId;
  createdAt: string;
  updatedAt: string;
  isFavorite: boolean;
  isDeleted: boolean;
  fileTemplate: string;
  lastCanvasTemplate: string | null;
  link: string | null;
}
