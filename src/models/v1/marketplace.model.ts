// marketplace.model.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface IMarketplaceFile extends Document {
  title: string;
  description: String;
  userID: Schema.Types.ObjectId;
  fileID: Schema.Types.ObjectId;
  status: string;
  courseName: string;
  noteTaker: string;
  lecture: string;
  createdAt: Date;
  updatedAt: Date;
  previewCanvases: Record<string, any>[];
  bgColor: String;
  university: String;
  type: String;
  price: String;
}

const marketplaceFileSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    userID: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    fileID: { type: Schema.Types.ObjectId, ref: 'File', required: true, unique: true },
    status: { type: String },
    courseName: { type: String },
    noteTaker: { type: String },
    lecture: { type: String },
    previewCanvases: [{
      type: Schema.Types.Mixed
    }],
    bgColor: { type: String },
    university: { type: String },
    type: { type: String },
    price: { type: String, required: true }
  },
  { timestamps: true },
);

export const MarketplaceFile = mongoose.model<IMarketplaceFile>(
  'MarketplaceFile',
  marketplaceFileSchema,
);
