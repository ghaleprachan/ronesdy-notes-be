import mongoose, { Model } from 'mongoose';
import { Canvas } from '../../models/v1/canvas.model';
import { ICanvas } from '../../models/v1/interfaces/canvas.interface';
import { CanvasDTO } from '../../dto/v1/common/canvas.dto';
import { ICanvasRepository } from './interfaces/canvas.interface';
import { JsonSerializer } from 'typescript-json-serializer';
import { UpdateCanvasRequestDTO } from '../../dto/v1/canvas/canvas/PUT/request.dto';
import { IFile } from '../../models/v1/interfaces/file.interface';
import { File } from '../../models/v1/file.model';
import { MongoError } from 'mongodb';
import { RepositoryError, ValidationError } from '../../utils/customError';

export default class CanvasRepository implements ICanvasRepository {
  private readonly canvasModel: Model<ICanvas>;
  private readonly fileModel: Model<IFile>;
  readonly deSerializer: JsonSerializer;

  constructor() {
    this.canvasModel = Canvas;
    this.fileModel = File;
    this.deSerializer = new JsonSerializer({
      nullishPolicy: {
        undefined: 'remove',
        null: 'remove',
      },
    });
  }

  async createCanvas(canvas: CanvasDTO): Promise<any> {
    try {
      const savedCanvases: ICanvas = await this.canvasModel.create(canvas);
      return savedCanvases;
    } catch (error) {
      if (error instanceof mongoose.Error.ValidationError) {
        throw new ValidationError(error.message);
      } else if (
        error instanceof MongoError &&
        (error.code === 11000 || error.code === 11001)
      ) {
        throw new RepositoryError('Duplicate property value', 400);
      } else {
        throw error;
      }
    }
  }

  async syncCanvas(canvasData: UpdateCanvasRequestDTO): Promise<any> {
    try {
      const result = await this.canvasModel.findOneAndUpdate<ICanvas>(
        { _id: canvasData._id },
        { $set: canvasData },
        { new: true },
      );
      return result!;
    } catch (error: any) {
      if (error instanceof mongoose.Error.ValidationError) {
        throw new ValidationError(error.message);
      } else {
        throw error;
      }
    }
  }

  async deleteCanvasAndUpdatePageNumber(canvasID: string): Promise<void> {
    try {
      const canvasToDelete = await this.canvasModel.findById(canvasID);
      if (!canvasToDelete) {
        throw new RepositoryError('Canvas not Found', 404);
      }

      const pageNumberToUpdate = canvasToDelete.pageNo;
      const deletedCanvas = await this.canvasModel.findByIdAndRemove(canvasID);

      if (!deletedCanvas) {
        console.log('Canvas not found or not deleted.');
        return;
      }
      const remainingCanvases = await this.canvasModel.find({
        fileID: deletedCanvas.fileID,
      });

      for (const canvas of remainingCanvases) {
        if (
          canvas._id !== deletedCanvas._id &&
          canvas.pageNo > pageNumberToUpdate
        ) {
          canvas.pageNo--;
          await canvas.save();
        }
      }
    } catch (error) {
      if (error instanceof mongoose.Error.ValidationError) {
        throw new ValidationError(error.message);
      } else if (
        error instanceof MongoError &&
        (error.code === 11000 || error.code === 11001)
      ) {
        throw new RepositoryError('Duplicate property value', 400);
      } else {
        throw error;
      }
    }
  }

  async isCanvasOwnedByUser(
    canvasID: string | undefined,
    userID: string,
  ): Promise<boolean> {
    let response = false;
    try {
      const canvas = await this.canvasModel.findById(canvasID);
      const file = await this.fileModel.findById(canvas?.fileID);
      if (String(file?.userID) === userID) {
        response = true;
      }
      return response;
    } catch (error) {
      if (error instanceof mongoose.Error.ValidationError) {
        throw new ValidationError(error.message);
      } else {
        throw error;
      }
    }
  }
}
