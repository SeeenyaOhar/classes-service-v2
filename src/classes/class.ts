import { object, string, number } from 'yup';

export const createClassSchema = object({
  title: string().required('Title is required').min(4).max(40).trim(),
  description: string()
    .required('Description is required')
    .min(30)
    .max(1000)
    .trim(),
  teacherId: number().required('Teacher ID is required'),
});

export const patchClassSchema = object({
  title: string().min(4).max(40).trim(),
  description: string().min(30).max(1000).trim(),
  teacherId: number(),
});
