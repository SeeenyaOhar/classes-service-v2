import { PrismaClient } from '@prisma/client';

export default class ClassAuthorizer {
  prisma: PrismaClient;
  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async isInClass(classId: number, userId: number) {
    return (
      (await this.isTeacherOf(classId, userId)) ||
      (await this.isStudentOf(userId, userId))
    );
  }

  private async isTeacherOf(userId: number, classId: number) {
    const cls = await this.prisma.class.findFirst({
      where: { id: classId },
    });

    if (cls && cls.teacherId === userId) {
      return true;
    }

    return false;
  }

  private async isStudentOf(classId: number, userId: number) {
    const classUser = await this.prisma.classUser.findFirst({
      where: {
        classId: classId,
        userId: userId,
      },
    });
    
    return Boolean(classUser);
  }
}
