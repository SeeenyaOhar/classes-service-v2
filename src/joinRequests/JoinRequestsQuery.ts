import { InferType, number, object } from 'yup';

export const joinRequestQuerySchema = object({
    classId: number().optional().moreThan(1),
    userId: number().optional().moreThan(1)
})

export const sendRequestBodySchema = object({
    classId: number().moreThan(1).required("Class ID is required!")
})

export const handleJoinRequestSchema = object({
    classId: number().moreThan(1).required("Class ID is required!"),
    userId: number().moreThan(1).required("User ID is required!")
})

export type ValidJoinRequest = InferType<typeof handleJoinRequestSchema>;
export type JoinRequestsQuery = InferType<typeof joinRequestQuerySchema>;