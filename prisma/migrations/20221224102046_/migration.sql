-- AlterTable
ALTER TABLE `Post` ADD COLUMN `downVote` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `image` VARCHAR(191) NULL,
    ADD COLUMN `upVote` INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE `Comment` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `postId` INTEGER NOT NULL,
    `text` VARCHAR(191) NOT NULL,
    `upVote` INTEGER NOT NULL DEFAULT 0,
    `downVote` INTEGER NOT NULL DEFAULT 0,

    UNIQUE INDEX `Comment_postId_key`(`postId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PostActions` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `postId` INTEGER NOT NULL,
    `upVote` BOOLEAN NULL,
    `downVote` BOOLEAN NULL,
    `commentId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CommentActions` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `postId` INTEGER NOT NULL,
    `commentId` INTEGER NOT NULL,
    `upVote` BOOLEAN NULL,
    `downVote` BOOLEAN NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Plants` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `commonName` VARCHAR(191) NULL,
    `botanicalName` VARCHAR(191) NULL,
    `Family` VARCHAR(191) NULL,
    `plantType` VARCHAR(191) NULL,
    `size` VARCHAR(191) NULL,
    `soilType` VARCHAR(191) NULL,
    `soilPH` VARCHAR(191) NULL,
    `hardinessZones` VARCHAR(191) NULL,
    `nativeArea` VARCHAR(191) NULL,
    `image` VARCHAR(191) NULL,
    `site` VARCHAR(191) NULL,
    `matureSize` VARCHAR(191) NULL,
    `bloomTime` VARCHAR(191) NULL,
    `flowerColor` VARCHAR(191) NULL,
    `toxicity` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Comment` ADD CONSTRAINT `Comment_postId_fkey` FOREIGN KEY (`postId`) REFERENCES `Post`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PostActions` ADD CONSTRAINT `PostActions_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PostActions` ADD CONSTRAINT `PostActions_postId_fkey` FOREIGN KEY (`postId`) REFERENCES `Post`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PostActions` ADD CONSTRAINT `PostActions_commentId_fkey` FOREIGN KEY (`commentId`) REFERENCES `Comment`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CommentActions` ADD CONSTRAINT `CommentActions_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CommentActions` ADD CONSTRAINT `CommentActions_postId_fkey` FOREIGN KEY (`postId`) REFERENCES `Post`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CommentActions` ADD CONSTRAINT `CommentActions_commentId_fkey` FOREIGN KEY (`commentId`) REFERENCES `Comment`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
