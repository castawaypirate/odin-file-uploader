/*
  Warnings:

  - Added the required column `secure_url` to the `files` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "files" ADD COLUMN     "secure_url" TEXT NOT NULL;
