ALTER TABLE `DocumentIngest`
  ADD COLUMN `sequencePosition` INTEGER NULL AFTER `suppressFlags`;

UPDATE `DocumentIngest` d
JOIN (
  SELECT
    `id`,
    ROW_NUMBER() OVER (
      PARTITION BY `companyId`
      ORDER BY
        COALESCE(NULLIF(`documentDate`, ''), DATE_FORMAT(`createdAt`, '%Y-%m-%d')),
        `createdAt`,
        `id`
    ) - 1 AS `seq`
  FROM `DocumentIngest`
) ranked ON ranked.`id` = d.`id`
SET d.`sequencePosition` = ranked.`seq`
WHERE d.`sequencePosition` IS NULL;

CREATE INDEX `DocumentIngest_company_sequence_idx`
  ON `DocumentIngest` (`companyId`, `sequencePosition`);
