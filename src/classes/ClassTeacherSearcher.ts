import { PrismaClient } from '@prisma/client';
import { NotFoundError } from '../errors/NotFoundError';

export class TeacherVerificationError extends Error {
  message: string;
  constructor(message: string) {
    super(message);
    this.message = message;
  }
}

export default class ClassTeacherSearcher {
  prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  public verifyUser(userId: number) {
    return {
      teacherOf: async (classId: number) => await this.teacherOf(userId, classId),
    };
  }

  private async teacherOf(userId: number, classId: number) {
    const cls = await this.prisma.class.findFirst({
      where: { id: classId },
    });

    if (!cls) {
      throw new NotFoundError(`Class with id=${classId} has not been found`);
    }

    if (userId !== cls.teacherId) { 
      throw new TeacherVerificationError(
        `User(id=${userId}) is not a teacher of class(id=${cls.id})`
      );
    }
  }
}
