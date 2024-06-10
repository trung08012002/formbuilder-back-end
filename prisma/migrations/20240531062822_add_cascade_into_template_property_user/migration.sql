-- DropForeignKey
ALTER TABLE "templates" DROP CONSTRAINT "templates_creator_id_fkey";

-- AddForeignKey
ALTER TABLE "templates" ADD CONSTRAINT "templates_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
