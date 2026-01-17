CREATE TABLE `revista_config_moderacao_comentarios` (
	`id` int AUTO_INCREMENT NOT NULL,
	`condominioId` int NOT NULL,
	`modoAutomatico` boolean DEFAULT false,
	`notificarNovoComentario` boolean DEFAULT true,
	`permitirComentariosAnonimos` boolean DEFAULT false,
	`filtrarPalavrasOfensivas` boolean DEFAULT true,
	`palavrasBloqueadas` text,
	`maxComentariosPorUsuario` int DEFAULT 10,
	`maxCaracteres` int DEFAULT 1000,
	`atualizadoPor` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `revista_config_moderacao_comentarios_id` PRIMARY KEY(`id`),
	CONSTRAINT `revista_config_moderacao_comentarios_condominioId_unique` UNIQUE(`condominioId`)
);
--> statement-breakpoint
CREATE TABLE `revista_templates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`condominioId` int,
	`nome` varchar(255) NOT NULL,
	`descricao` text,
	`tipo` enum('mensal','trimestral','especial','boas_vindas','personalizado') DEFAULT 'personalizado',
	`secoesIncluidas` json,
	`ordemSecoes` json,
	`configCapa` json,
	`configEstilo` json,
	`previewImageUrl` varchar(500),
	`ativo` boolean DEFAULT true,
	`padrao` boolean DEFAULT false,
	`criadoPor` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `revista_templates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `revista_config_moderacao_comentarios` ADD CONSTRAINT `revista_config_moderacao_comentarios_condominioId_condominios_id_fk` FOREIGN KEY (`condominioId`) REFERENCES `condominios`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `revista_config_moderacao_comentarios` ADD CONSTRAINT `revista_config_moderacao_comentarios_atualizadoPor_users_id_fk` FOREIGN KEY (`atualizadoPor`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `revista_templates` ADD CONSTRAINT `revista_templates_condominioId_condominios_id_fk` FOREIGN KEY (`condominioId`) REFERENCES `condominios`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `revista_templates` ADD CONSTRAINT `revista_templates_criadoPor_users_id_fk` FOREIGN KEY (`criadoPor`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;