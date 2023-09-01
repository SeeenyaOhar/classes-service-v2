-- DropForeignKey
ALTER TABLE "class" DROP CONSTRAINT "class_teacher_id_fkey";

-- DropForeignKey
ALTER TABLE "class_thumbnail" DROP CONSTRAINT "class_thumbnail_class_id_fkey";

-- DropForeignKey
ALTER TABLE "class_user" DROP CONSTRAINT "class_user_class_fkey";

-- DropForeignKey
ALTER TABLE "message" DROP CONSTRAINT "message_class__fkey";

-- DropForeignKey
ALTER TABLE "request" DROP CONSTRAINT "request_class_fkey";

-- DropForeignKey
ALTER TABLE "teacher" DROP CONSTRAINT "teacher_user_id_fkey";

-- AddForeignKey
ALTER TABLE "class" ADD CONSTRAINT "class_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "teacher"("user_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "class_thumbnail" ADD CONSTRAINT "class_thumbnail_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "class"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "class_user" ADD CONSTRAINT "class_user_class_fkey" FOREIGN KEY ("class") REFERENCES "class"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "message" ADD CONSTRAINT "message_class__fkey" FOREIGN KEY ("class_") REFERENCES "class"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "request" ADD CONSTRAINT "request_class_fkey" FOREIGN KEY ("class") REFERENCES "class"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "teacher" ADD CONSTRAINT "teacher_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
