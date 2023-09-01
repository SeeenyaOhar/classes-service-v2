import { PrismaClient } from '@prisma/client';
import { ValidatedUser, userSchema } from './User';
import { ValidationError } from 'yup';
import { UniqueError, UniqueUserValidator } from './UniqueUserValidator';

export class UniqueConstraintError extends Error{
    uniqueErrors: UniqueError[];
    constructor(message: string, uniqueErrors: UniqueError[]){
        super(message);
        this.uniqueErrors = uniqueErrors;
    }
}

export default class UserValidator {
  prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async validate(data: unknown): Promise<ValidatedUser> {
      try {
        const uniqueValidator = new UniqueUserValidator(
          userSchema,
          this.prisma
        );
        const user = userSchema.cast(data);
        const uniqueErrors = await uniqueValidator.сheckUniqueErrors(user);

        if (uniqueErrors.length !== 0) {
          throw new UniqueConstraintError("UniqueConstraintError", uniqueErrors);
        }

        return user;
      } catch (error) {
        if (error instanceof ValidationError) {
          throw error;
        }
        throw new Error();
      }
  }
}
