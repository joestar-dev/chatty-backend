import { Request, Response } from 'express';
import { authMock, authMockRequest, authMockResponse } from '@root/mocks/auth.mock';
import * as cloudinaryUploads from '@global/helpers/cloudinary-upload';
import { SignUp } from '../signup';
import { CustomError } from '@global/helpers/error-handler';
import { authService } from '@service/db/auth.service';
import { IAuthDocument } from '@auth/interfaces/auth.interface';
import { UserCache } from '@service/redis/user.cache';

jest.mock('@service/queues/base.queue');
jest.mock('@service/queues/auth.queue');
jest.mock('@service/queues/user.queue');
jest.mock('@service/redis/user.cache');
jest.mock('@global/helpers/cloudinary-upload');

describe('SignUp', () => {

  beforeEach(() => {
    // jest.resetAllMock();
  });

  afterEach(() => {
    jest.clearAllMocks();
  })

  it('should throw an error if username dose not available', () => {
    const req: Request = authMockRequest({}, {
      username: '',
      email: 'joestar@mail.com',
      password: 'joestar1',
      avatarColor: 'red',
      avatarImage: 'data:text/plain;base64,SGVsdfsdfaSFdfsdf=='
    }) as Request

    const res: Response = authMockResponse();

    SignUp.prototype.create(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Username is a required field');
    });
  });

  it('should throw an error if username length is less that minimun length', () => {
    const req: Request = authMockRequest({}, {
      username: 'joe',
      email: 'joestar@mail.com',
      password: 'joestar1',
      avatarColor: 'red',
      avatarImage: 'data:text/plain;base64,SGVsdfsdfaSFdfsdf=='
    }) as Request

    const res: Response = authMockResponse();

    SignUp.prototype.create(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Invalid username');
    });
  });

  // it('should throw an error if username length is greater that maximum length', () => {
  //   const req: Request = authMockRequest({}, {
  //     username: 'joestarr',
  //     email: 'joestar@mail.com',
  //     password: 'joestar1',
  //     avatarColor: 'red',
  //     avatarImage: 'data:text/plain;base64,SGVsdfsdfaSFdfsdf=='
  //   }) as Request

  //   const res: Response = authMockResponse();

  //   SignUp.prototype.create(req, res).catch((error: CustomError) => {
  //     expect(error.statusCode).toEqual(400);
  //     expect(error.serializeErrors().message).toEqual('Invalid username');
  //   });
  // });

  it('should throw an unauthorize error if user has already exist', () => {
    const req: Request = authMockRequest({}, {
      username: 'joestar',
      email: 'joestar@mail.com',
      avatarColor: '#9c27b0',
      password: 'joestar1',
      avatarImage: 'data:text/plain;base64,SGVsdfsdfaSFdfsdf=='
    }) as Request

    const res: Response = authMockResponse();

    jest.spyOn(authService, 'getUserByUsernameOrEmail').mockResolvedValue(authMock);
    SignUp.prototype.create(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Invalid credentials');
    });
  });

  it('should throw an error if email is invalid', () => {
    const req: Request = authMockRequest({}, {
      username: 'joestar',
      email: 'joestar',
      password: 'joestar1',
      avatarColor: 'red',
      avatarImage: 'data:text/plain;base64,SGVsdfsdfaSFdfsdf=='
    }) as Request

    const res: Response = authMockResponse();

    SignUp.prototype.create(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Email must be valid');
    });
  });

  it('should throw an error if email is not available', () => {
    const req: Request = authMockRequest({},{
      username: 'joestar',
      email: '',
      password: 'joestar1',
      avatarColor: 'red',
      avatarImage: 'data:text/plain;base64,SGVsdfsdfaSFdfsdf=='
    }) as Request

    const res: Response = authMockResponse();

    SignUp.prototype.create(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Email is a required field');
    });
  });

  it('should set session data for valid credentials and send correct json response', async () => {
    const req: Request = authMockRequest({}, {
      username: 'joestar',
      email: 'joestar@mail.com',
      avatarColor: '#9c27b0',
      password: 'joestar1',
      avatarImage: 'data:text/plain;base64,SGVsdfsdfaSFdfsdf=='
    }) as Request

    const res: Response = authMockResponse();

    jest.spyOn(authService, 'getUserByUsernameOrEmail').mockResolvedValue(null as any);
    const userSpy = jest.spyOn(UserCache.prototype, 'saveUserToCache');
    jest.spyOn(cloudinaryUploads, 'uploads').mockImplementation((): any => Promise.resolve({ version: '123123', public_id: "4324324234" }));

    await SignUp.prototype.create(req, res);
    console.log(userSpy.mock)
    expect(req.session?.jwt).toBeDefined();
    expect(res.json).toHaveBeenCalledWith({
      message: "User created successfully",
      user: userSpy.mock.calls[0][2],
      token: req.session?.jwt
    })
    // expect(res.json).toHaveBeenCalledWith({
    //   message: "User create successfully",
    //   user: userSpy.mock.calls[0][2],
    //   token: req.session?.jwt
    // });
    // SignUp.prototype.create(req, res).catch((error: CustomError) => {
    //   expect(error.statusCode).toEqual(400);
    //   expect(error.serializeErrors().message).toEqual('Invalid credentials');
    // });
  });
});
