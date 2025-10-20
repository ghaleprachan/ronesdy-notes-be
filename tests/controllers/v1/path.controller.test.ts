import { Request, Response, NextFunction } from 'express';
import PathController from '../../../src/controllers/v1/path.controller'; 


describe('PathController()', () => {
  let pathController:PathController;
  let req: Request;
  let res: Response;
  req = {} as Request;
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

  beforeEach(() => {
    pathController = new PathController();
  });
});
