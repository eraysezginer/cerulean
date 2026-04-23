-- MySQL 8+ / utf8mb4 — kurulum: mysql < db/schema.sql
-- veya: mysql -u ... -p cerulean < db/schema.sql

CREATE TABLE IF NOT EXISTS `Company` (
    `id` VARCHAR(191) NOT NULL,
    `legalName` VARCHAR(191) NOT NULL,
    `cadence` VARCHAR(191) NOT NULL,
    `health` INTEGER NOT NULL DEFAULT 50,
    `flags` INTEGER NOT NULL DEFAULT 0,
    `lastUpdate` VARCHAR(191) NOT NULL DEFAULT '—',
    `series` VARCHAR(191) NULL,
    `formData` LONGTEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `Note` (
    `id` VARCHAR(191) NOT NULL,
    `companyId` VARCHAR(191) NOT NULL,
    `tag` VARCHAR(191) NOT NULL,
    `date` VARCHAR(191) NOT NULL,
    `text` TEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    INDEX `Note_companyId_idx`(`companyId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `DocumentIngest` (
    `id` VARCHAR(191) NOT NULL,
    `jobId` VARCHAR(191) NOT NULL,
    `companyId` VARCHAR(191) NOT NULL,
    `documentId` VARCHAR(191) NOT NULL,
    `fileDisplayName` VARCHAR(512) NOT NULL,
    `fileCount` INTEGER NOT NULL,
    `totalSizeBytes` INTEGER NOT NULL,
    `primaryHash` VARCHAR(128) NOT NULL,
    `extraHashesJson` TEXT NOT NULL,
    `documentTypeName` VARCHAR(255) NOT NULL,
    `temporalType` VARCHAR(64) NOT NULL,
    `updateLabel` VARCHAR(512) NOT NULL,
    `documentDate` VARCHAR(64) NOT NULL,
    `receivedDate` VARCHAR(64) NOT NULL,
    `language` VARCHAR(64) NOT NULL,
    `originalSender` VARCHAR(512) NOT NULL,
    `howReceived` VARCHAR(255) NOT NULL,
    `provenance` TEXT NOT NULL,
    `optForensic` BOOLEAN NOT NULL,
    `optExternal` BOOLEAN NOT NULL,
    `optDigest` BOOLEAN NOT NULL,
    `suppressFlags` BOOLEAN NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'processing',
    `processingSeconds` INTEGER NULL,
    `jobStartedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `storedFilesJson` TEXT NOT NULL,
    `flagsJson` TEXT NULL,
    `aiAnalysisText` LONGTEXT NULL,
    `aiAnalysisModel` VARCHAR(255) NULL,
    `aiAnalysisAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    UNIQUE INDEX `DocumentIngest_jobId_key`(`jobId`),
    INDEX `DocumentIngest_companyId_idx`(`companyId`),
    INDEX `DocumentIngest_documentId_idx`(`documentId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
