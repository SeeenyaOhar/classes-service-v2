import { User } from '@prisma/client';

type NoIdUser = Omit<User, 'id'>;
type NoPassword<T> = Omit<T, 'password'>;

export type UserResponseDTO = NoPassword<NoIdUser>;