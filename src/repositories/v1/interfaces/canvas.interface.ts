import { CanvasDTO } from '../../../dto/v1/common/canvas.dto';
import { ICanvas } from '../../../models/v1/interfaces/canvas.interface';
import { UpdateCanvasRequestDTO } from '../../../dto/v1/canvas/canvas/PUT/request.dto';
import { NextFunction } from 'express';

export interface ICanvasRepository {
  createCanvas(canvas: CanvasDTO): Promise<any>;
  deleteCanvasAndUpdatePageNumber(canvasID: string): Promise<void>;
  syncCanvas(canvas: UpdateCanvasRequestDTO): Promise<any>;
}
