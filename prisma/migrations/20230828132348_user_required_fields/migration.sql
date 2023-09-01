/*
  Warnings:

  - Made the column `username` on table `user` required. This step will fail if there are existing NULL values in that column.
  - Made the column `firstName` on table `user` required. This step will fail if there are existing NULL values in that column.
  - Made the column `lastName` on table `user` required. This step will fail if there are existing NULL values in that column.
  - Made the column `email` on table `user` required. This step will fail if there are existing NULL values in that column.
  - Made the column `password` on table `user` required. This step will fail if there are existing NULL values in that column.
  - Made the column `phone` on table `user` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "user" ALTER COLUMN "username" SET NOT NULL,
ALTER COLUMN "firstName" SET NOT NULL,
ALTER COLUMN "lastName" SET NOT NULL,
ALTER COLUMN "email" SET NOT NULL,
ALTER COLUMN "password" SET NOT NULL,
ALTER COLUMN "phone" SET NOT NULL;
