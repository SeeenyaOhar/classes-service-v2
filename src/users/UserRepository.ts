import { PrismaClient, User } from '@prisma/client';
import { ValidatedUser } from './User';
import { NotFoundError } from '../errors/NotFoundError';


export default class UserRepository {
  prisma: PrismaClient;
  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  public async createUser(userData: ValidatedUser): Promise<number> {
      const user = await this.prisma.user.create({
        data: userData,
      });

      if (!user) {
        throw new Error("User was not created due to some server-side error");
      }

      return user.id;
  }

  public async findUserByUsername(username: string): Promise<User> {
    const user = await this.prisma.user.findFirst({
      where: {
        username: username,
      },
    });

    if (!user || !user.password) {
      throw new NotFoundError(
        'User with such password or username has not been found'
      );
    }

    return user;
  }
}
