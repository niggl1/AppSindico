ALTER TABLE `caronas` MODIFY COLUMN `usuarioId` int;--> statement-breakpoint
ALTER TABLE `classificados` MODIFY COLUMN `usuarioId` int;--> statement-breakpoint
ALTER TABLE `caronas` ADD `moradorId` int;--> statement-breakpoint
ALTER TABLE `caronas` ADD `contato` varchar(255);--> statement-breakpoint
ALTER TABLE `classificados` ADD `moradorId` int;--> statement-breakpoint
ALTER TABLE `moradores` ADD `senha` varchar(255);--> statement-breakpoint
ALTER TABLE `moradores` ADD `loginToken` varchar(64);--> statement-breakpoint
ALTER TABLE `moradores` ADD `loginTokenExpira` timestamp;--> statement-breakpoint
ALTER TABLE `moradores` ADD `ultimoLogin` timestamp;--> statement-breakpoint
ALTER TABLE `caronas` ADD CONSTRAINT `caronas_moradorId_moradores_id_fk` FOREIGN KEY (`moradorId`) REFERENCES `moradores`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `classificados` ADD CONSTRAINT `classificados_moradorId_moradores_id_fk` FOREIGN KEY (`moradorId`) REFERENCES `moradores`(`id`) ON DELETE no action ON UPDATE no action;