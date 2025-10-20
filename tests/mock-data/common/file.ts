import mongoose from 'mongoose';

interface FileData {
  fileName: string;
  localFileID: string;
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

// Sample data
export const fileData: FileData = {
  fileName: 'SampleFile',
  localFileID: 'file_12345',
  folderID: new mongoose.Types.ObjectId(), // Generate a new ObjectId
  userID: new mongoose.Types.ObjectId(), // Generate a new ObjectId
  createdAt: new Date().toISOString(), // Current time in ISO format
  updatedAt: new Date().toISOString(), // Current time in ISO format
  isFavorite: true,
  isDeleted: false,
  fileTemplate: 'template1',
  lastCanvasTemplate: 'canvas1',
  link: null,
};
