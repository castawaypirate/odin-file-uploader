-- AlterTable
ALTER TABLE "files" ADD COLUMN     "deleted_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "folders" ADD COLUMN     "deleted_at" TIMESTAMP(3);
