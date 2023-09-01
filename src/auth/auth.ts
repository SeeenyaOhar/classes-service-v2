import { User } from '@prisma/client';
import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

interface AuthorizationPayload extends jwt.JwtPayload {
  id: number;
  role: 'student' | 'teacher';
}

export interface AuthRequest extends Request {
  auth: AuthorizationPayload;
}

export class ForbiddenError extends Error {
  constructor(message: string) {
    super(message);
  }
}

export function issueToken({ id, role }: User) {
  return jwt.sign({ id, role }, process.env.JWT_SECRET as string, {
    expiresIn: 10 * 60,
    issuer: 'Classes',
  });
}

function getToken(req: Request): string {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) throw new Error();

  return token;
}

export function verifyToken(req: Request, res: Response, next: NextFunction) {
  try {
    const token = getToken(req);
    jwt.verify(token, process.env.JWT_SECRET as string, (err, data) => {
      if (err || typeof data !== 'object') return res.sendStatus(403);
      const payload = data as AuthorizationPayload;
      const authReq = req as AuthRequest;
      authReq.auth = payload;

      next();
    });
  } catch (error) {
    return res.sendStatus(401);
  }
}

export function verifyTeacher(req: Request, res: Response, next: NextFunction) {
  if ('auth' in req === false) {
    res.sendStatus(403);
    return;
  }
  const authRequest = req as AuthRequest;
  const role = authRequest?.auth?.role;
  if (!role || role !== 'teacher') {
    res.sendStatus(403);
    return;
  }
  next();
}

export function verifyOwnerOrTeacher(authReq: AuthRequest, id1: number) {
  const { role, id: id2 } = authReq.auth;

  if (id1 !== id2 && role !== 'teacher') {
    throw new ForbiddenError('You are not an owner of this resource.');
  }
}

export class NoAuthProvidedError extends Error {
  constructor(message: string){
    super(message);
  }
}

export function getAuth(req: Request){
  if ('auth' in req === false) {
    throw new NoAuthProvidedError("The server didn't provide auth to the request.");
  }

  return (req as AuthRequest).auth;
}

type PasswordPair = {
  firstPassword: string;
  secondPassword: string;
};

export async function compareHashes({
  firstPassword,
  secondPassword,
}: PasswordPair): Promise<boolean> {
  return await bcrypt.compare(firstPassword, secondPassword);
}
