ALTER TABLE `condominios` ADD `cadastroToken` varchar(32);--> statement-breakpoint
ALTER TABLE `condominios` ADD CONSTRAINT `condominios_cadastroToken_unique` UNIQUE(`cadastroToken`);