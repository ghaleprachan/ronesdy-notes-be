import { Request, Response, NextFunction } from 'express';
import CanvasController from '../../../src/controllers/v1/canvas.controller';
import CreateCanvasRequest from '../../mock-data/canvas/create-canvas/request.json';
import CreateCanvasResponse from '../../mock-data/canvas/create-canvas/response.json';
import SyncCanvasRequest from '../../mock-data/canvas/sync-canvas/request.json';
import SyncCanvasResponse from '../../mock-data/canvas/sync-canvas/response.json';
import { StatusCodes } from 'http-status-codes';
import { CANVAS_CONTROLLER } from '../../../src/utils/enum';
import { fileData } from '../../mock-data/common/file';
import { userData } from '../../mock-data/common/user';
import { ForbiddenError } from '../../../src/middleware/errorHandlingMiddleware';
describe('CanvasController', () => {
  let canvasController: CanvasController;
  let req: Request;
  let res: Response;
  let next: NextFunction;
  next = {} as NextFunction;
  beforeEach(() => {
    canvasController = new CanvasController();
    req = {} as Request;
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;
    next = {} as NextFunction;
  });

  afterEach(() => {
    jest.restoreAllMocks(); // Reset all mocked functions between tests
  });

  describe('createCanvas', () => {
    it('should create a canvas and return success message', async () => {
      // Mock valid create canvas request
      req.body = CreateCanvasRequest;

      canvasController.canvasRepository.createCanvas = jest
        .fn()
        .mockResolvedValueOnce(CreateCanvasResponse);

      let responseData:any = { }; 
      responseData.message = CANVAS_CONTROLLER.SUCCESS.CANVAS_CREATED;
      responseData.response = CreateCanvasResponse;
      responseData.success = true;

      await canvasController.createCanvas(
        req as Request,
        res as Response,
        next,
      );

      // Assertions
      expect(res.status).toHaveBeenCalledWith(StatusCodes.CREATED);
      expect(res.json).toHaveBeenCalledWith(responseData);
    });

    // Add more test cases for various scenarios: invalid data, error handling, etc.
  });

  describe('syncCanvas', () => {
    it('should sync a canvas and return success message', async () => {
      // Mock valid sync canvas request
      req.body = SyncCanvasRequest;
      req.body.user = userData;

      canvasController.canvasRepository.isCanvasOwnedByUser = jest.fn().mockResolvedValueOnce(true);
      canvasController.pathRepository.updateFile = jest.fn().mockResolvedValueOnce(fileData);
      canvasController.canvasRepository.syncCanvas = jest.fn().mockResolvedValueOnce(SyncCanvasResponse.response);
      await canvasController.syncCanvas(req as Request, res as Response, next as NextFunction);

      expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
      expect(res.json).toHaveBeenCalledWith(SyncCanvasResponse);
    });

    // it('should throw ForbiddenError if user does not own the canvas', async () => {
    //   req.body = SyncCanvasRequest;
    //   req.body.user = userData;

    //   canvasController.canvasRepository.isCanvasOwnedByUser = jest.fn().mockResolvedValueOnce(false);
  
    //   try {
    //     // Call the validateCanvasAccess function
    //     await canvasController.syncCanvas(req as Request, res as Response, next as NextFunction);
    //     // If the code reaches here, the test should fail
    //     expect(true).toBe(false); // Indicate that the test should fail if it reaches this line
    //   } catch (error) {
    //     // Check if the error thrown is an instance of ForbiddenError
    //     expect(error).toBeInstanceOf(ForbiddenError);
    //     // Ensure that the ForbiddenError was thrown with the correct message
    //    // expect(error.message).toBe('No access to canvas');
    //     // Ensure next function was not called
    //     expect(next).toHaveBeenCalled();
    //   }
    // });

    // Add more test cases for various scenarios: invalid data, error handling, etc.
  });

  describe('deleteCanvas', () => {
    it('should delete a canvas and return success', async () => {
      const req = {
        params: { id: 'mock_canvas_id' },
        body: { user: userData }
      } as unknown as Request;

      canvasController.canvasRepository.isCanvasOwnedByUser = jest.fn().mockResolvedValueOnce(true);
      canvasController.canvasRepository.deleteCanvasAndUpdatePageNumber = jest.fn().mockResolvedValueOnce(null);

      await canvasController.deleteCanvas(
        req as Request,
        res as Response,
        next,
      );

      expect(res.status).toHaveBeenCalledWith(StatusCodes.NO_CONTENT);
    });

    
  });
});
