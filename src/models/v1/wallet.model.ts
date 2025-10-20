import mongoose from 'mongoose';

const WalletSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    stripeCustomerId: {
      type: String,
      required: true,
    },
    balance: {
      type: Number,
      required: true,
    },
    destinations: [
      {
        type: { type: String },
        id: { type: String },
        accountHolder: { type: String },
        bankName: { type: String },
        lastFour: { type: String },
      },
    ],
  },
  {
    timestamps: true,
  },
);

export const Wallet = mongoose.model('Wallet', WalletSchema);
