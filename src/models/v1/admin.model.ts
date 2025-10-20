import mongoose from 'mongoose';

const AdminSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    superAdmin: { type: Boolean, default: false }
  },
  {
    timestamps: true,
  },
);

export const Admin = mongoose.model('Admin', AdminSchema);
