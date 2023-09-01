import { PrismaClient } from '@prisma/client';
import express, { Request, Response } from 'express';
import { ValidationError } from 'yup';
import { handleJoinRequestSchema, joinRequestQuerySchema, sendRequestBodySchema } from './JoinRequestsQuery';
import JoinRequestsAuthorizer from './JoinRequestsAuthorizer';
import { NoAuthProvidedError, getAuth, verifyTeacher, verifyToken } from '../auth/auth';
import ResourceNotExistsError from '../errors/ResourceNotExists';

export default function JoinRequestController() {
  const router = express.Router();
  const prisma = new PrismaClient();
  const joinRequestsAuthorizer = new JoinRequestsAuthorizer(prisma);

  async function getJoinRequests(req: Request, res: Response) {
    try {
      const {id: userId} = getAuth(req);
      const query = joinRequestQuerySchema.cast(req?.query);
      if (
        (await joinRequestsAuthorizer
          .verifyUser(userId)
          .hasAccessToJoinRequests(query)) === false
      ) {
        res.sendStatus(403);
        return;
      }
      const joinRequests = await prisma.request.findMany({
        where: query,
      });

      if (!joinRequests || joinRequests.length === 0) {
        res.sendStatus(404);
        return;
      }

      res.json(joinRequests);
    } catch (error) {
      if (error instanceof ValidationError) {
        res.status(400).json({ message: error.message });
      }
      if (error instanceof NoAuthProvidedError) {
        res.status(500).json({ message: error.message});
      }
    }
  }

  async function sendJoinRequest(req: Request, res: Response) {
    try{
      const request = sendRequestBodySchema.cast(req.body);
      const {id: userId} = getAuth(req);
      if (!await joinRequestsAuthorizer.verifyUser(userId).canSendJoinRequestTo(request.classId)){
        res.sendStatus(403);
        return;
      }

      await prisma.request.create({
        data: {
          classId: request.classId,
          userId: userId
        }
      })

      res.sendStatus(201);
    }
    catch(error){
      if (error instanceof ValidationError){
        res.status(400).json({message: error.message});
      }

      if (error instanceof ResourceNotExistsError){
        if (error.key === 'class'){
          res.status(422).json({message: error.message, key: error.key});
        }
      }
    }
  }

  async function acceptJoinRequest(req: Request, res: Response) {
    try{
      const {id: userId} = getAuth(req);
      const joinRequest = handleJoinRequestSchema.cast(req.body);
      if (await joinRequestsAuthorizer.verifyUser(userId).canResolveJoinRequest(joinRequest) === false){
        res.sendStatus(403);
        return;
      }
      await prisma.classUser.create({
        data: joinRequest
      })
      await prisma.request.delete({
        where: {
          classId_userId: joinRequest
        }
      })
    }
    catch(error){
      if (error instanceof ValidationError){
        res.status(400).json({message: error.message});
      }
      if (error instanceof ResourceNotExistsError){
        res.status(422).json({message: error.message, key: error.key}); 
      }
    }
  }
  
  async function declineJoinRequest(req: Request, res: Response) {
    try{
      const {id: userId} = getAuth(req);
      const joinRequest = handleJoinRequestSchema.cast(req.body);
      if (await joinRequestsAuthorizer.verifyUser(userId).canResolveJoinRequest(joinRequest) === false){
        res.sendStatus(403);
        return;
      }
      await prisma.request.delete({
        where: {
          classId_userId: joinRequest
        }
      })
    }
    catch(error){
      if (error instanceof ValidationError){
        res.status(400).json({message: error.message});
      }
      if (error instanceof ResourceNotExistsError){
        res.status(422).json({message: error.message, key: error.key}); 
      }
    }
  }

  router.get('/', verifyToken, getJoinRequests);
  router.post('/send', verifyToken, sendJoinRequest);
  router.post('/accept', verifyToken, verifyTeacher, acceptJoinRequest);
  router.post('/decline', verifyToken, verifyTeacher, declineJoinRequest);

  return router;
}
