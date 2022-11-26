/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `password` to the `User` table without a default value. This is not possible if the table is not empty.
  - Made the column `name` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `Post` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `publishedAt` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `Profile` ADD COLUMN `Address` VARCHAR(191) NULL,
    ADD COLUMN `profilePic` VARCHAR(191) NULL,
    ADD COLUMN `profilePicThumbnail` VARCHAR(191) NULL,
    ADD COLUMN `profileUserName` VARCHAR(191) NOT NULL DEFAULT 'Anonymous';

-- AlterTable
ALTER TABLE `User` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `password` VARCHAR(191) NOT NULL,
    MODIFY `name` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `User_name_key` ON `User`(`name`);
