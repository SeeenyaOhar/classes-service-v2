import express, { Request, Response } from 'express';
import { AuthRequest, verifyToken } from '../auth/auth';
import { PrismaClient } from '@prisma/client';
import { InferType, ValidationError, number, object } from 'yup';
import MessageAuthorizer, { GetMessagesFilter } from './MessageAuthorizer';
import ClassAuthorizer from '../auth/ClassAuthorizer';

const getMessagesQuerySchema = object({
  id: number().optional().integer().min(1),
  page: number().optional().integer().min(1).default(1),
  classId: number().optional().integer().min(1),
});



function getFilterClause(query: InferType<typeof getMessagesQuerySchema>) {
  const filterClause: GetMessagesFilter = {};

  if (query?.id) {
    filterClause.id = query.id;
  }

  if (query?.classId) {
    filterClause.class_ = query.classId;
  }

  return filterClause;
}

export default function MessageController() {
  const router = express.Router();
  const prisma = new PrismaClient();
  const messageAuthorizer = new MessageAuthorizer(prisma, new ClassAuthorizer(prisma));

  async function getMessages(req: Request, res: Response) {
    // query args:
    // 1) id - id of the message itself
    // 2) page - pagination number
    // 3) classId - the class of the message
    const pageSize = 20;
    if ("auth" in req === false){
        res.sendStatus(403);
        return;
    }
    const userId = (req as AuthRequest).auth.id;

    try {
      const query = getMessagesQuerySchema.cast(req?.query);
      const filterClause = getFilterClause(query);
      if (await messageAuthorizer
        .verifyUser(userId)
        .hasAccessToMessages(filterClause) === false){
            res.status(403).json({message: "You have no access to this range of messages."})
        }

      const messages = await prisma.message.findMany({
        where: filterClause,
        skip: (query.page - 1) * pageSize,
        take: pageSize,
      });

      if (!messages || messages.length === 0) {
        res.sendStatus(404);
        return;
      }

      res.json(messages);
    } catch (error) {
      if (error instanceof ValidationError) {
        res.sendStatus(422);
      }
    }
  }
//   async function createMessage(req: Request, res: Response) {}
//   async function updateMessage(req: Request, res: Response) {}
//   async function deleteMessage(req: Request, res: Response) {}

  router.get('/message', verifyToken, getMessages);
//   router.post('/message', verifyToken, createMessage);
//   router.patch('/message', verifyToken, updateMessage);
//   router.delete('/message', verifyToken, deleteMessage);

return router;
}
