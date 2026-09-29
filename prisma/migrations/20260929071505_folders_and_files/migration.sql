/*
  Warnings:

  - You are about to drop the column `expiresAt` on the `sessions` table. All the data in the column will be lost.
  - Added the required column `expires_at` to the `sessions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "sessions" DROP COLUMN "expiresAt",
ADD COLUMN     "expires_at" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "folders" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "parent_folder_id" TEXT,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "folders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "files" (
    "id" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "size" BIGINT NOT NULL,
    "path" TEXT NOT NULL,
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "folder_id" TEXT NOT NULL,

    CONSTRAINT "files_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "folders_user_id_idx" ON "folders"("user_id");

-- CreateIndex
CREATE INDEX "files_folder_id_idx" ON "files"("folder_id");

-- AddForeignKey
ALTER TABLE "folders" ADD CONSTRAINT "folders_parent_folder_id_fkey" FOREIGN KEY ("parent_folder_id") REFERENCES "folders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "folders" ADD CONSTRAINT "folders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "files" ADD CONSTRAINT "files_folder_id_fkey" FOREIGN KEY ("folder_id") REFERENCES "folders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
