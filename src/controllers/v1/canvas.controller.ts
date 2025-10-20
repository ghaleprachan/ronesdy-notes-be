import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { JsonSerializer } from 'typescript-json-serializer';
import { CanvasRepository, PathRepository } from '../../repositories/v1';
import {
  UpdateCanvasRequestDTO,
  UpdateCanvasResponseDTO,
  CreateCanvasRequestDTO,
} from '../../dto/v1/canvas';
import { RepositoryError } from '../../utils/customError';
import { RenameFileRequestDTO } from '../../dto/v1/path';
import {
  ForbiddenError,
  InternalServerError,
  NotFoundError,
} from '../../middleware/errorHandlingMiddleware';
import { deserializeToDTO } from '../../utils/deserializer';
import { CANVAS_CONTROLLER, CONTROLLERS } from '../../utils/enum';

export default class CanvasController {
  public readonly canvasRepository: CanvasRepository;
  public readonly deSerializer: JsonSerializer;
  public readonly pathRepository: PathRepository;

  constructor() {
    this.canvasRepository = new CanvasRepository();
    this.deSerializer = new JsonSerializer();
    this.pathRepository = new PathRepository();
  }

  async createCanvas(req: Request, res: Response, next: NextFunction) {
    try {
      const request = deserializeToDTO(req.body, CreateCanvasRequestDTO);
      const response = await this.canvasRepository.createCanvas(request!);
      res.status(StatusCodes.CREATED).json({
        success: true,
        message: CANVAS_CONTROLLER.SUCCESS.CANVAS_CREATED,
        response,
      });
    } catch (error) {
      if (error instanceof RepositoryError) {
        next(new NotFoundError());
      } else {
        next(new InternalServerError());
      }
    }
  }

  async syncCanvas(req: Request, res: Response, next: NextFunction) {
    const user = req.body.user;
    try {
      const request = deserializeToDTO(req.body, UpdateCanvasRequestDTO);
      await this.validateCanvasAccess(request!._id, user._id, next);

      const fileCanvasTemplateUpdateRequest = new RenameFileRequestDTO(request);
      const fileCanvasTemplateUpdateResponse =
        await this.pathRepository.updateFile(fileCanvasTemplateUpdateRequest);
      const data = await this.canvasRepository.syncCanvas(request!);

      const response = deserializeToDTO(data, UpdateCanvasResponseDTO);
      res.status(StatusCodes.OK).json({
        success: true,
        message: CANVAS_CONTROLLER.SUCCESS.CANVAS_UPDATED,
        response,
      });
      return;
    } catch (error) {
      next(new InternalServerError());
    }
  }

  async deleteCanvas(req: Request, res: Response, next: NextFunction) {
    const canvasID = req.params.id;
    const user = req.body.user;
    try {
      await this.validateCanvasAccess(canvasID, user._id, next);
      
      const response =
        await this.canvasRepository.deleteCanvasAndUpdatePageNumber(canvasID);

      res.status(StatusCodes.NO_CONTENT).json({
        success: response,
        message: CANVAS_CONTROLLER.SUCCESS.CANVAS_UPDATED,
      });
    } catch (error) {
      next(new InternalServerError());
    }
  }

  async validateCanvasAccess(
    canvasID: string | undefined,
    userID: string,
    next: NextFunction,
  ) {
    userID = userID.toString();
    if (
      canvasID &&
      !(await this.canvasRepository.isCanvasOwnedByUser(canvasID, userID))
    ) {
      next(
        new ForbiddenError(
          CANVAS_CONTROLLER.VALIDATION.NO_ACCESS,
          CONTROLLERS.CANVAS_CONTROLLER,
        ),
      );
      return;
    }
  }
}
