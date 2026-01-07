ALTER TABLE `manutencoes` ADD `tempoEstimadoDias` int DEFAULT 0;--> statement-breakpoint
ALTER TABLE `manutencoes` ADD `tempoEstimadoHoras` int DEFAULT 0;--> statement-breakpoint
ALTER TABLE `manutencoes` ADD `tempoEstimadoMinutos` int DEFAULT 0;--> statement-breakpoint
ALTER TABLE `manutencoes` DROP COLUMN `custoEstimado`;--> statement-breakpoint
ALTER TABLE `manutencoes` DROP COLUMN `custoReal`;