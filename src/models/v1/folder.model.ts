import mongoose from 'mongoose';
import { IFolder } from '../v1/interfaces/folder.interface';

const folderSchema = new mongoose.Schema(
  {
    folderName: {
      type: String,
      required: true,
    },
    localFolderID: {
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
    userID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true, // Add createdAt and updatedAt fields
  },
);

export const Folder = mongoose.model<IFolder>('Folder', folderSchema);
