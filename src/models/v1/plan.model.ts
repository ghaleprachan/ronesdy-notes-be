import mongoose from 'mongoose';
const planSchema = new mongoose.Schema( 
  {
    planName: {
      type: String,
      required: true,
    },
    apple_product_id: {
      type: String,
    },
    price: {
      type: String,
    },
    storage: {
      type: Number,
    },
    duration: {
      type: String
    },
    ad: {
      type: String
    },
    marketplace: {
      type: String
    },
    marketplaceSeller: {
      type: String
    },
    marketplaceCommission: {
      type: Number
    }
  },
  {
    timestamps: true,
  },
);

export const Plan = mongoose.model<any>('Plan', planSchema);
