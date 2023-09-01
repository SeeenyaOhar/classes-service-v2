import { Role } from '@prisma/client';
import { InferType, mixed, object, string } from 'yup';

export const userSchema = object({
    username: string().required('Username is required').min(8).max(20),
    password: string().required('Password is required').min(8).max(30),
    firstName: string().required('First Name is required'),
    lastName: string().required('Last Name is required'),
    email: string().email().required('Email is required'),
    phone: string()
      .default('student')
      .matches(
        new RegExp('^[+]?[(]?[0-9]{3}[)]?[-s.]?[0-9]{3}[-s.]?[0-9]{4,6}$'),
        {
          message:
            'There is something wrong with the phone number. Check it out.',
        }
      ),
    role: mixed<Role>().required(...Object.values(Role)),
  });
export const credentialsSchema = object({
    username: string().required('Username is required!').min(8),
    password: string().required('Password is required!').min(8),
  });
export type ValidatedUser = InferType<typeof userSchema>;
export type ValidatedCredentials = InferType<typeof credentialsSchema>;