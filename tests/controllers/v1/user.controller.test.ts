import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import UserController from '../../../src/controllers/v1/user.controller';
import { signupRequest } from '../../mock-data/user/signup/request';
import { mock } from 'node:test';
import { userData } from '../../mock-data/common/user';
import { StatusCodes } from 'http-status-codes';
import { USER_CONTROLLER } from '../../../src/utils/enum';

describe('UserController', () => {
  let userController: UserController;
  let req: Request;
  let res: Response;
  let next: NextFunction;
  beforeEach(() => {
    userController = new UserController();
    req = {} as Request;
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;
    next = jest.fn(); // Assign a mock function to next
  });

  afterEach(() => {
    jest.restoreAllMocks(); // Reset all mocked functions between tests
  });
  describe('signup', () => {
    it('should register a user successfully', async () => {
      const mockedToken = 'mockedTokenValue';
      // Mock valid signup data and user creation
      req.body = signupRequest;
      userController.userRepository.findByEmail = jest
        .fn()
        .mockImplementation(() => {
          return jest
            .fn()
            .mockResolvedValueOnce([]) // First call resolves with an empty array
            .mockResolvedValueOnce(userData); // Second call resolves with userData
        });
      userController.userRepository.create = jest
        .fn()
        .mockResolvedValueOnce(true);

      jest.spyOn(jwt, 'sign').mockImplementation(() => {
        return mockedToken;
      });
      // jest.mock('jsonwebtoken', () => ({
      //   sign: jest.fn().mockReturnValue('mockedTokenValue'),
      // }));

      await userController.signup(req, res, next);

      // Check if response status is set to CREATED
      expect(res.status).toHaveBeenCalledWith(StatusCodes.CREATED);
      // Check if response contains success message and token
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: USER_CONTROLLER.SUCCESS.USER_REGISTERED,
        token: mockedToken,
      });
    });
  });

  describe('login', () => {
    it('should successfully log in and return a token', async () => {
      const mockedToken = 'mockedTokenValue';
      req.body = { email: 'test@example.com', password: 'hashedPassword' };
      userController.userRepository.findByEmail = jest
        .fn()
        .mockResolvedValueOnce(userData);

      bcrypt.compare = jest.fn().mockResolvedValue(true);
      jest.spyOn(jwt, 'sign').mockImplementation(() => {
        return mockedToken;
      });

      // Call the login function
      await userController.login(
        req as Request,
        res as Response,
        next as NextFunction,
      );

      // Check the response
      expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: USER_CONTROLLER.SUCCESS.LOGIN_SUCCESSFUL,
        token: 'mockedTokenValue',
        response: userData,
      });
    });
  });
});
