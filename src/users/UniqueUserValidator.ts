import { PrismaClient } from '@prisma/client';
import { ISchema, InferType, ObjectSchema } from 'yup';
import { ValidatedUser } from './User';

export type UniqueError = {
  key: string;
};

export class UniqueUserValidator<TSchema extends ISchema<any, any, any>> {
  userSchema: TSchema;
  prisma: PrismaClient;
  constructor(userSchema: TSchema, prisma: PrismaClient) {
    this.userSchema = userSchema;
    this.prisma = prisma;
  }
  public async сheckUniqueErrors(data: ValidatedUser): Promise<UniqueError[]> {
    const checksResults = await Promise.all(this.getChecks(data));
    const checkKeys = ['email', 'username', 'phone'] as const;
    const uniqueErrors: UniqueError[] = [];

    checksResults.forEach((check, index) => {
      if (check) {
        uniqueErrors.push({ key: checkKeys[index] });
      }
    });

    return uniqueErrors;
  }

  private getChecks(data: ValidatedUser) {
    const emailCheck = this.prisma.user.findFirst({
      where: {
        email: data.email,
      },
    });

    const usernameCheck = this.prisma.user.findFirst({
      where: {
        username: data.username,
      },
    });

    const phoneCheck = this.prisma.user.findFirst({
      where: {
        phone: data.phone,
      },
    });

    return [emailCheck, usernameCheck, phoneCheck];
  }
}
