-- CreateEnum
CREATE TYPE "role" AS ENUM ('teacher', 'student');

-- CreateTable
CREATE TABLE "alembic_version" (
    "version_num" VARCHAR(32) NOT NULL,

    CONSTRAINT "alembic_version_pkc" PRIMARY KEY ("version_num")
);

-- CreateTable
CREATE TABLE "class" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR,
    "description" VARCHAR,
    "teacher_id" INTEGER,

    CONSTRAINT "class_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "class_thumbnail" (
    "id" SERIAL NOT NULL,
    "class_id" INTEGER,
    "image" BYTEA,

    CONSTRAINT "class_thumbnail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "class_user" (
    "class" INTEGER NOT NULL,
    "user" INTEGER NOT NULL,

    CONSTRAINT "class_user_pkey" PRIMARY KEY ("class","user")
);

-- CreateTable
CREATE TABLE "message" (
    "id" SERIAL NOT NULL,
    "content" VARCHAR,
    "date" TIMESTAMP(6) NOT NULL,
    "user" INTEGER,
    "class_" INTEGER,

    CONSTRAINT "message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "request" (
    "class" INTEGER NOT NULL,
    "user" INTEGER NOT NULL,

    CONSTRAINT "request_pkey" PRIMARY KEY ("class","user")
);

-- CreateTable
CREATE TABLE "teacher" (
    "user_id" INTEGER NOT NULL,
    "diplomas" VARCHAR[],
    "employment" VARCHAR[],

    CONSTRAINT "teacher_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "user" (
    "id" SERIAL NOT NULL,
    "username" VARCHAR,
    "firstName" VARCHAR,
    "lastName" VARCHAR,
    "email" VARCHAR,
    "password" VARCHAR,
    "phone" VARCHAR,
    "role" "role",

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_username_key" ON "user"("username");

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_phone_key" ON "user"("phone");

-- AddForeignKey
ALTER TABLE "class" ADD CONSTRAINT "class_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "teacher"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "class_thumbnail" ADD CONSTRAINT "class_thumbnail_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "class"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "class_user" ADD CONSTRAINT "class_user_class_fkey" FOREIGN KEY ("class") REFERENCES "class"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "class_user" ADD CONSTRAINT "class_user_user_fkey" FOREIGN KEY ("user") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "message" ADD CONSTRAINT "message_class__fkey" FOREIGN KEY ("class_") REFERENCES "class"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "message" ADD CONSTRAINT "message_user_fkey" FOREIGN KEY ("user") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "request" ADD CONSTRAINT "request_class_fkey" FOREIGN KEY ("class") REFERENCES "class"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "request" ADD CONSTRAINT "request_user_fkey" FOREIGN KEY ("user") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "teacher" ADD CONSTRAINT "teacher_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

