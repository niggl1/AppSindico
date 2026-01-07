ALTER TABLE `moradores` MODIFY COLUMN `apartamento` varchar(20) NOT NULL;--> statement-breakpoint
ALTER TABLE `moradores` MODIFY COLUMN `tipo` enum('proprietario','inquilino','familiar','funcionario') DEFAULT 'proprietario';--> statement-breakpoint
ALTER TABLE `moradores` ADD `celular` varchar(20);--> statement-breakpoint
ALTER TABLE `moradores` ADD `andar` varchar(10);--> statement-breakpoint
ALTER TABLE `moradores` ADD `cpf` varchar(14);--> statement-breakpoint
ALTER TABLE `moradores` ADD `dataNascimento` timestamp;--> statement-breakpoint
ALTER TABLE `moradores` ADD `fotoUrl` text;--> statement-breakpoint
ALTER TABLE `moradores` ADD `observacoes` text;--> statement-breakpoint
ALTER TABLE `moradores` ADD `dataEntrada` timestamp;--> statement-breakpoint
ALTER TABLE `moradores` ADD `dataSaida` timestamp;