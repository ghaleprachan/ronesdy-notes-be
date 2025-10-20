import mongoose from 'mongoose';
import { IFile } from '../v1/interfaces/file.interface';

const fileSchema = new mongoose.Schema(
  {
    fileName: {
      type: String,
      required: true,
    },
    folderID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Folder',
    },
    localFileID: {
      type: String,
      default: null,
    },
    lastCanvasTemplate: {
      type: String,
      default: null,
    },
    isFavorite: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    fileTemplate: {
      type: String,
      default: 'BLANK',
    },
    userID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      //required: true,
    },
    link: {
      type: String,
      default: null
    }
  },
  {
    timestamps: true, // Add createdAt and updatedAt fields
  },
);

export const File = mongoose.model<IFile>('File', fileSchema);
