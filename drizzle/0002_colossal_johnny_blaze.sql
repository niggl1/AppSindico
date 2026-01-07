CREATE TABLE `notificacoes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`condominioId` int,
	`tipo` enum('aviso','evento','votacao','classificado','carona','geral') NOT NULL,
	`titulo` varchar(255) NOT NULL,
	`mensagem` text,
	`link` varchar(500),
	`referenciaId` int,
	`lida` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notificacoes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `preferencias_notificacao` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`avisos` boolean DEFAULT true,
	`eventos` boolean DEFAULT true,
	`votacoes` boolean DEFAULT true,
	`classificados` boolean DEFAULT true,
	`caronas` boolean DEFAULT true,
	`emailNotificacoes` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `preferencias_notificacao_id` PRIMARY KEY(`id`),
	CONSTRAINT `preferencias_notificacao_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
ALTER TABLE `notificacoes` ADD CONSTRAINT `notificacoes_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `notificacoes` ADD CONSTRAINT `notificacoes_condominioId_condominios_id_fk` FOREIGN KEY (`condominioId`) REFERENCES `condominios`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `preferencias_notificacao` ADD CONSTRAINT `preferencias_notificacao_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;