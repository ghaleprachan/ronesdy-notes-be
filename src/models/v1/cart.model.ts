// cart.model.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface ICart extends Document {
  userId: Schema.Types.ObjectId;
  fileId: Schema.Types.ObjectId;
}

const cartSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  fileId: { type: Schema.Types.ObjectId, ref: 'MarketplaceFile', required: true },
}, { timestamps: true });

cartSchema.index({ userId: 1, fileId: 1 }, { unique: true });

export const Cart = mongoose.model<ICart>('Cart', cartSchema);