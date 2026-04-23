-- Mevcut veritabanına uygulayın: mysql -u ... -p cerulean < db/migrations/001_document_ingest_ai_analysis.sql

ALTER TABLE `DocumentIngest`
  ADD COLUMN `aiAnalysisText` LONGTEXT NULL AFTER `flagsJson`,
  ADD COLUMN `aiAnalysisModel` VARCHAR(255) NULL AFTER `aiAnalysisText`,
  ADD COLUMN `aiAnalysisAt` DATETIME(3) NULL AFTER `aiAnalysisModel`;
