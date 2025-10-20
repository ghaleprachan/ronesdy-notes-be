import mongoose from 'mongoose';

interface IPathObject {
  color: string;
  data: string[];
  id: number;
  width: number;
}

interface ISize {
  height: number;
  width: number;
}

interface IShapeObject{
  color: string;
  x: number;
  y: number;
  type: string;
  height: number;
  width: number;
  filled: boolean;
  stroke: number|null;
  sides: number|null;
}

interface ICanvasPath {
  drawer: string;
  path: IPathObject;
  size: ISize;
}

export interface ICanvas extends mongoose.Document {
  fileID: mongoose.Types.ObjectId;
  pageNo: number;
  localCanvasID: string;
  paths: ICanvasPath[];
  createdAt: Date;
  updatedAt: Date;
  canvasTemplate: string|null;
  shapes: IShapeObject[];
  isBookmarked: boolean;
  localFileID: string|null;
}