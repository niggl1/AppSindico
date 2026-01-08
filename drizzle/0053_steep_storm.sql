CREATE TABLE `inscricoes_revista` (
	`id` int AUTO_INCREMENT NOT NULL,
	`condominioId` int NOT NULL,
	`revistaId` int,
	`nome` varchar(255) NOT NULL,
	`email` varchar(320) NOT NULL,
	`unidade` varchar(50),
	`whatsapp` varchar(20),
	`status` enum('pendente','ativo','inativo') NOT NULL DEFAULT 'pendente',
	`ativadoPor` int,
	`dataAtivacao` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `inscricoes_revista_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `inscricoes_revista` ADD CONSTRAINT `inscricoes_revista_condominioId_condominios_id_fk` FOREIGN KEY (`condominioId`) REFERENCES `condominios`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `inscricoes_revista` ADD CONSTRAINT `inscricoes_revista_revistaId_revistas_id_fk` FOREIGN KEY (`revistaId`) REFERENCES `revistas`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `inscricoes_revista` ADD CONSTRAINT `inscricoes_revista_ativadoPor_users_id_fk` FOREIGN KEY (`ativadoPor`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;