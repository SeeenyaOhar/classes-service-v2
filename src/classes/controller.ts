import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { ValidationError } from 'yup';
import { InvalidIdError, getIdFromParam } from '../requestUtils';
import { createClassSchema, patchClassSchema } from './class';
import { verifyToken, verifyTeacher, AuthRequest } from '../auth/auth';
import ClassTeacherSearcher, { TeacherVerificationError } from './ClassTeacherSearcher';
import { NotFoundError } from '../errors/NotFoundError';

const isString = (a: unknown) => typeof a === 'string' || a instanceof String;

type RequestPageArgs = {
  request: Request;
  response: Response;
};

const getRequestPage = ({ request, response }: RequestPageArgs) => {
  let page = 1;
  if (isString(request?.query?.page)) {
    page = Number.parseInt(request.query.page as string);
    if (Number.isNaN(page)) {
      response.sendStatus(422);
      return;
    }
  }

  if (page === 0) {
    response.status(422).json({ message: 'Page cannot be 0' });
    return null;
  }

  return page;
};

export default function ClassesController(): express.Router {
  const router = express.Router();
  const prisma = new PrismaClient();
  const classTeacherSearcher = new ClassTeacherSearcher(prisma);

  async function getClasses(req: Request, res: Response) {
    const pageSize = 20;
    const page = getRequestPage({ request: req, response: res });
    if (!page) return;

    const classes = await prisma.class.findMany({
      skip: pageSize * (page - 1),
      take: pageSize,
    });

    if (!classes || classes.length === 0) {
      res.sendStatus(404);
      return;
    }

    res.json(classes);
  }

  async function createClass(req: Request, res: Response) {
    try {
      const classData = createClassSchema.cast(req.body);

      const cls = await prisma.class.create({
        data: classData,
      });

      if (!cls) {
        res.sendStatus(500);
        return;
      }
      res.json(cls).status(201);
    } catch (error) {
      if (error instanceof ValidationError) {
        res.json(error).status(422);
        return;
      }
      res.sendStatus(500);
    }
  }

  async function getClassById(req: Request, res: Response) {
    try {
      const id = getIdFromParam(req);
      if (!id) return;

      const cls = await prisma.class.findUnique({
        where: { id },
      });

      if (!cls) {
        res.sendStatus(404);
        return;
      }

      res.json(cls);
    } catch (error) {
      if (error instanceof InvalidIdError) {
        console.log(error);
        res.status(400).json(error);
        return;
      }
      res.sendStatus(500);
    }
  }

  async function updateClassById(req: Request, res: Response) {
    if ('auth' in req === false) {
      res.sendStatus(403);
      return;
    }
    const authReq = req as AuthRequest;
    try {
      const classId = getIdFromParam(req);
      if (!classId) return;

      const patchData = patchClassSchema.cast(req.body);
      const { id: userId } = authReq.auth;
      await classTeacherSearcher
        .verifyUser(userId)
        .teacherOf(classId);
      const cls = await prisma.class.update({
        data: patchData,
        where: { id: classId },
      });
      if (!cls) {
        res.status(404);
      }

      res.json(cls);
    } catch (error) {
      if (error instanceof InvalidIdError) {
        res.status(400).json(error);
      }
      if (error instanceof ValidationError) {
        res.status(422).json(error);
      }
      if (error instanceof NotFoundError){
        res.status(404).send({message: error.message});
      }
      if (error instanceof TeacherVerificationError){
        console.log(error);
        res.status(403).json(error);
      }
    }
  }

  async function deleteClassById(req: Request, res: Response) {
    const exists = async (id: number) =>
      (await prisma.class.count({
        where: { id },
      })) === 1;

    try {
      const classId = getIdFromParam(req);

      if (!(await exists(classId))) {
        res.sendStatus(404);
        return;
      }
      const response = await prisma.class.delete({
        where: { id: classId },
      });

      if (response === null) {
        res.sendStatus(500);
        return;
      }

      res.json(response);
    } catch (error) {
      if (error instanceof InvalidIdError) {
        res.status(400).json(error);
      }
      res.status(500).json(error);
    }
  }

  router.get('/class', getClasses);
  router.post('/class', verifyToken, verifyTeacher, createClass);
  router.get('/class/:id', getClassById);
  router.patch('/class/:id', verifyToken, verifyTeacher, updateClassById);
  router.delete('/class/:id', verifyToken, verifyTeacher, deleteClassById);

  return router;
}
