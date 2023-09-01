import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { ValidationError } from 'yup';
import {
  AuthRequest,
  compareHashes,
  issueToken,
  verifyOwnerOrTeacher,
  verifyTeacher,
  verifyToken,
} from '../auth/auth';
import UserValidator, { UniqueConstraintError } from './UserValidator';
import UserRepository from './UserRepository';
import UserCredentialsValidator from './UserCredentialsValidator';
import bcrypt from 'bcrypt';
import { InvalidIdError, getIdFromParam } from '../requestUtils';
import { UserResponseDTO } from './UserResponseDTO';
import { NotFoundError } from '../errors/NotFoundError';

export default function UsersController() {
  const router = express.Router();
  const prisma = new PrismaClient();
  const userValidator = new UserValidator(prisma);
  const userRepository = new UserRepository(prisma);
  const credentialsValidator = new UserCredentialsValidator();

  async function signUp(req: Request, res: Response) {
    try {
      const validatedUserData = await userValidator.validate({
        ...req?.body,
        role: 'student',
      });
      validatedUserData.password = await bcrypt.hash(
        validatedUserData.password,
        10
      );
      const id = await userRepository.createUser(validatedUserData);
      res.status(201).json({
        id,
      });
    } catch (error) {
      if (error instanceof UniqueConstraintError) {
        res.status(422).json(error);
      }
      if (error instanceof ValidationError) {
        res.status(400).json(error);
      }
      res.sendStatus(500);
    }
  }

  async function login(req: Request, res: Response) {
    try {
      const credentials = credentialsValidator.validate(req.body);
      const user = await userRepository.findUserByUsername(
        credentials.username
      );

      const isEqual = await compareHashes({
        firstPassword: credentials.password,
        secondPassword: user.password,
      });
      if (!isEqual) {
        res.status(401).json({
          message: 'User with such password or username has not been found',
        });
      }

      const token = issueToken(user);
      res.json({ accessToken: token });
    } catch (error) {
      if (error instanceof ValidationError) {
        res.status(400).json(error);
      }
      if (error instanceof NotFoundError) {
        res.status(404).json(error);
      }
    }
  }

  async function getAuthUser(req: Request, res: Response) {
    if ('auth' in req === false) {
      res.sendStatus(403);
      return;
    }
    const authRequest = req as AuthRequest;
    const userId = authRequest.auth.id;

    try {
      const user = await prisma.user.findFirst({
        where: {
          id: userId,
        },
      });

      if (!user) {
        res.sendStatus(404);
        return;
      }
      const userResponseDto: UserResponseDTO = {
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role,
      };
      res.json(userResponseDto);
    } catch (error) {
      console.error(error);
      res.sendStatus(500);
    }
  }

  async function createUser(req: Request, res: Response) {
    const body = req.body;
    if (!req.body) return res.sendStatus(400);
    try {
      const validatedUser = await userValidator.validate({
        body,
        prisma,
        response: res,
      });
      if (!validatedUser) return;
      validatedUser.password = await bcrypt.hash(validatedUser.password, 10);
      const id = await userRepository.createUser(validatedUser);

      res.status(201).json({ id });
    } catch (error) {
      if (error instanceof UniqueConstraintError) {
        res.status(400).json(error);
      }
      res.status(500).json(error);
    }
  }

  async function getUserById(req: Request, res: Response) {
    try {
      const id = getIdFromParam(req);

      const user = await prisma.user.findFirst({
        where: {
          id: id,
        },
      });

      if (!user) {
        res.sendStatus(404);
        return;
      }
      const userResponseDto: UserResponseDTO = {
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role,
      };
      res.json(userResponseDto);
    } catch (error) {
      if (error instanceof InvalidIdError) {
        res.status(400).json(error);
      }
      res.sendStatus(500);
    }
  }

  async function updateUserById(req: Request, res: Response) {
    if ('auth' in req === false) {
      res.sendStatus(403);
    }
    const authReq = req as AuthRequest;
    try {
      const id = getIdFromParam(authReq);
      verifyOwnerOrTeacher(authReq, id);

      const data = req.body;
      if (!data) {
        return res.sendStatus(400);
      }

      const updatedUser = await prisma.user.update({
        where: {
          id,
        },
        data,
      });

      if (!updatedUser) return res.sendStatus(404);
      res.json(updatedUser);
    } catch (error) {
      if (error instanceof InvalidIdError) {
        res.status(400).json(error);
      }
      res.sendStatus(500);
    }
  }

  async function deleteUserById(req: Request, res: Response) {
    try {
      const id = getIdFromParam(req);

      const user = await prisma.user.findFirst({
        where: {
          id: id,
        },
      });

      if (!user) {
        res.sendStatus(404);
        return;
      }

      await prisma.user.delete({
        where: {
          id: id,
        },
      });
      const userResponseDto: UserResponseDTO = {
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role,
      }

      res.json(userResponseDto);
    } catch (error) {
      if (error instanceof InvalidIdError) {
        res.status(400).json(error);
      }
      res.sendStatus(500);
    }
  }

  router.get('/user', verifyToken, getAuthUser);
  router.get('/user/:id', getUserById);
  router.post('/signUp', signUp);
  router.post('/login', login);
  router.post('/user', verifyToken, verifyTeacher, createUser);
  router.patch('/user/:id', verifyToken, updateUserById);
  router.delete('/user/:id', verifyToken, verifyTeacher, deleteUserById);

  return router;
}