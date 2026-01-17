CREATE TABLE `revista_agendamentos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`revistaId` int NOT NULL,
	`dataPublicacao` timestamp NOT NULL,
	`status` enum('agendado','publicado','cancelado','erro') DEFAULT 'agendado',
	`notificarMoradores` boolean DEFAULT true,
	`notificarEmail` boolean DEFAULT true,
	`notificarPush` boolean DEFAULT true,
	`mensagemNotificacao` text,
	`dataExecucao` timestamp,
	`erroMensagem` text,
	`criadoPor` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `revista_agendamentos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `revista_assinantes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`condominioId` int NOT NULL,
	`nome` varchar(255) NOT NULL,
	`email` varchar(255),
	`whatsapp` varchar(20),
	`unidade` varchar(50),
	`receberEmail` boolean DEFAULT true,
	`receberWhatsapp` boolean DEFAULT false,
	`receberPush` boolean DEFAULT true,
	`ativo` boolean DEFAULT false,
	`dataAtivacao` timestamp,
	`ativadoPor` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `revista_assinantes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `revista_comentarios` (
	`id` int AUTO_INCREMENT NOT NULL,
	`revistaId` int NOT NULL,
	`usuarioId` int,
	`moradorId` int,
	`secaoId` varchar(50) NOT NULL,
	`secaoTipo` varchar(50),
	`texto` text NOT NULL,
	`status` enum('pendente','aprovado','rejeitado') DEFAULT 'pendente',
	`moderadoPor` int,
	`dataModeracao` timestamp,
	`motivoRejeicao` text,
	`parentId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `revista_comentarios_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `revista_visualizacoes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`revistaId` int NOT NULL,
	`usuarioId` int,
	`secaoId` varchar(50),
	`paginaNumero` int,
	`tempoLeitura` int,
	`dispositivo` varchar(50),
	`navegador` varchar(100),
	`ipHash` varchar(64),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `revista_visualizacoes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `revista_agendamentos` ADD CONSTRAINT `revista_agendamentos_revistaId_revistas_id_fk` FOREIGN KEY (`revistaId`) REFERENCES `revistas`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `revista_agendamentos` ADD CONSTRAINT `revista_agendamentos_criadoPor_users_id_fk` FOREIGN KEY (`criadoPor`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `revista_assinantes` ADD CONSTRAINT `revista_assinantes_condominioId_condominios_id_fk` FOREIGN KEY (`condominioId`) REFERENCES `condominios`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `revista_assinantes` ADD CONSTRAINT `revista_assinantes_ativadoPor_users_id_fk` FOREIGN KEY (`ativadoPor`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `revista_comentarios` ADD CONSTRAINT `revista_comentarios_revistaId_revistas_id_fk` FOREIGN KEY (`revistaId`) REFERENCES `revistas`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `revista_comentarios` ADD CONSTRAINT `revista_comentarios_usuarioId_users_id_fk` FOREIGN KEY (`usuarioId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `revista_comentarios` ADD CONSTRAINT `revista_comentarios_moradorId_moradores_id_fk` FOREIGN KEY (`moradorId`) REFERENCES `moradores`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `revista_comentarios` ADD CONSTRAINT `revista_comentarios_moderadoPor_users_id_fk` FOREIGN KEY (`moderadoPor`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `revista_visualizacoes` ADD CONSTRAINT `revista_visualizacoes_revistaId_revistas_id_fk` FOREIGN KEY (`revistaId`) REFERENCES `revistas`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `revista_visualizacoes` ADD CONSTRAINT `revista_visualizacoes_usuarioId_users_id_fk` FOREIGN KEY (`usuarioId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;