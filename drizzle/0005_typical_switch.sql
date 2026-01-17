CREATE TABLE `configuracoes_notificacoes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`usuarioId` int NOT NULL,
	`receberNotificacoesPush` boolean DEFAULT true,
	`receberNotificacoesEmail` boolean DEFAULT true,
	`notificarComentarios` boolean DEFAULT true,
	`notificarMencoes` boolean DEFAULT true,
	`notificarTimelines` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `configuracoes_notificacoes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notificacoes_push` (
	`id` int AUTO_INCREMENT NOT NULL,
	`usuarioId` int,
	`condominioId` int,
	`titulo` varchar(255) NOT NULL,
	`mensagem` text NOT NULL,
	`tipo` enum('comentario','mencao','timeline','sistema') DEFAULT 'sistema',
	`timelineId` int,
	`comentarioId` int,
	`lida` boolean DEFAULT false,
	`dataLeitura` timestamp,
	`icone` varchar(50),
	`cor` varchar(20),
	`linkAcao` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notificacoes_push_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `configuracoes_notificacoes` ADD CONSTRAINT `configuracoes_notificacoes_usuarioId_users_id_fk` FOREIGN KEY (`usuarioId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `notificacoes_push` ADD CONSTRAINT `notificacoes_push_usuarioId_users_id_fk` FOREIGN KEY (`usuarioId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `notificacoes_push` ADD CONSTRAINT `notificacoes_push_condominioId_condominios_id_fk` FOREIGN KEY (`condominioId`) REFERENCES `condominios`(`id`) ON DELETE no action ON UPDATE no action;