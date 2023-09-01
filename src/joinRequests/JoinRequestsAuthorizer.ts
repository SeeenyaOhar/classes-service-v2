import { PrismaClient } from '@prisma/client';
import { JoinRequestsQuery, ValidJoinRequest } from './JoinRequestsQuery';
import ResourceNotExistsError from '../errors/ResourceNotExists';

export default class JoinRequestsAuthorizer {
  prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  public verifyUser(userId: number) {
    return {
      hasAccessToJoinRequests: async (filter: JoinRequestsQuery) =>
        await this.hasAccessToJoinRequests(filter, userId),
      canSendJoinRequestTo: async (classId: number) =>
        await this.canSendJoinRequestTo(classId, userId),
      canResolveJoinRequest: async (joinRequest: ValidJoinRequest) => await this.canResolveJoinRequest(joinRequest, userId)
    };
  }

  private async canResolveJoinRequest(request: ValidJoinRequest, userId: number) {
    const dbRequest = await this.prisma.request.findFirst({
      where: request
    });
    if (!dbRequest) throw new ResourceNotExistsError("Join Request you have specified doesn't exist.", "joinRequest");
    return this.isTeacherOf(request.classId, userId);
  }

  private async canSendJoinRequestTo(classId: number, userId: number) {
    return (
      !this.hasJoinedClass(classId, userId) &&
      !this.alreadySentRequest(classId, userId) &&
      !this.isTeacherOf(userId, classId)
    );
  }

  private async hasAccessToJoinRequests(
    filter: JoinRequestsQuery,
    userId: number
  ) {
    if (filter?.classId) {
      const isTeacher = this.isTeacherOf(filter.classId, userId);
      if (filter?.userId) {
        return isTeacher || userId === filter?.userId;
      }

      return isTeacher;
    }

    if (filter?.userId) {
      return userId === filter?.userId;
    }
  }

  private async hasJoinedClass(classId: number, userId: number) {
    const classUser = await this.prisma.classUser.findFirst({
      where: {
        classId,
        userId,
      },
    });

    return Boolean(classUser);
  }

  private async alreadySentRequest(classId: number, userId: number) {
    const request = await this.prisma.request.findFirst({
      where: {
        classId,
        userId,
      },
    });

    return Boolean(request);
  }

  private async isTeacherOf(userId: number, classId: number) {
    const cls = await this.prisma.class.findFirst({
      where: { id: classId },
    });

    if (!cls) {
      return new ResourceNotExistsError(`Class(id=${classId}) doesn't exist.`, "class");
    }

    return !cls || cls.teacherId === userId;
  }
}
