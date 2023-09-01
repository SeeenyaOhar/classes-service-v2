import { PrismaClient } from '@prisma/client';
import ClassAuthorizer from '../auth/ClassAuthorizer';

export interface GetMessagesFilter {
  id?: number;
  class_?: number;
}

export default class MessageAuthorizer {
  prisma: PrismaClient;
  classAuthorizer: ClassAuthorizer;
  constructor(prisma: PrismaClient, classAuthorizer: ClassAuthorizer) {
    this.prisma = prisma;
    this.classAuthorizer = classAuthorizer;
  }

  public verifyUser(userId: number) {
    return {
      hasAccessToMessages: (filter: GetMessagesFilter) =>
        this.hasAccessToMessages(userId, filter),
    };
  }

  public async hasAccessToMessages(userId: number, filter: GetMessagesFilter) {
    const {class_: classId, id} = filter;
    if (classId) {
      return this.classAuthorizer.isInClass(classId, userId);
    }

    if (id) {
      const message = await this.findMessageById(id);
      if (!message)
        return true;

      return await this.classAuthorizer.isInClass(message.class_, userId)
    }
  }

  private async findMessageById(id: number) {
    return await this.prisma.message.findFirst({
      where: {
        id,
      },
    });
  }
}
