// marketplace.model.ts
import mongoose, { Document, Schema } from 'mongoose';
import { PURCHASE_TYPES } from '../../utils/enum';

export interface IPurchase extends Document {
  userID: Schema.Types.ObjectId;
  marketplaceID: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  type: String;
  price: String;
  transactionId: String;
  subscriptionType: String,
  subscriptionName: String
}

const purchaseSchema: Schema = new Schema(
  {
    userID: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    marketplaceID: { type: Schema.Types.ObjectId, ref: 'MarketplaceFile', default: null },
    type: {
      type: String,
      enum: [PURCHASE_TYPES.IAP, PURCHASE_TYPES.SUBSCRIPTION],
      required: true,
    },
    price: { type: String },
    transactionId: { type: String },
    subscriptionType: { type: String, default: null },
    subscriptionName: { type: String, default: null },
  },
  { timestamps: true },
);

export const Purchase = mongoose.model<IPurchase>(
  'Purchase',
  purchaseSchema,
);
