import mongoose from 'mongoose';
import { ICanvas } from './interfaces/canvas.interface';

const sizeSchema = new mongoose.Schema({
  height: Number,
  width: Number,
});

const pathObjectSchema = new mongoose.Schema({
  color: String,
  data: [String],
  id: Number,
  width: Number,
});

const shapeObjectSchema = new mongoose.Schema({
  color: String,
  x: Number,
  y: Number,
  type: String,
  height: Number,
  width: Number,
  filled: Boolean,
  stroke: {
    type: Number,
    default: null,
  },
  sides: {
    type: Number,
    default: null,
  },
});

const canvasSchema = new mongoose.Schema(
  {
    canvasTemplate: {
      type: String,
      default: null,
    },
    fileID: {
      type: String,
    },
    localCanvasID: {
      type: String,
      default: null,
    },
    pageNo: {
      type: Number,
    },
    paths: [
      {
        drawer: { type: String },
        path: pathObjectSchema,
        size: sizeSchema,
      },
    ],
    shapes: [shapeObjectSchema],
    isBookmarked: {
      type: Boolean,
      default: false,
    },
    localFileID: {
      type: String,
      default: null,
    }
  },
  {
    timestamps: true, // Add createdAt and updatedAt fields
  },
);

export const Canvas = mongoose.model<ICanvas>('Canvas', canvasSchema);
