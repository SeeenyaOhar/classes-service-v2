/*
  Warnings:

  - Made the column `user` on table `message` required. This step will fail if there are existing NULL values in that column.
  - Made the column `class_` on table `message` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "message" ALTER COLUMN "user" SET NOT NULL,
ALTER COLUMN "class_" SET NOT NULL;
