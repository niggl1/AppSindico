CREATE TABLE `timeline_comentario_templates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`condominioId` int,
	`usuarioId` int,
	`titulo` varchar(100) NOT NULL,
	`texto` text NOT NULL,
	`categoria` varchar(50),
	`icone` varchar(50),
	`cor` varchar(20),
	`publico` boolean DEFAULT false,
	`ativo` boolean DEFAULT true,
	`ordem` int DEFAULT 0,
	`vezesUsado` int DEFAULT 0,
	`ultimoUso` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `timeline_comentario_templates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `timeline_lembretes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`timelineId` int NOT NULL,
	`usuarioId` int,
	`condominioId` int,
	`titulo` varchar(255) NOT NULL,
	`descricao` text,
	`dataLembrete` timestamp NOT NULL,
	`notificarEmail` boolean DEFAULT true,
	`notificarPush` boolean DEFAULT true,
	`antecedencia` int DEFAULT 0,
	`status` enum('pendente','enviado','cancelado') DEFAULT 'pendente',
	`dataEnvio` timestamp,
	`recorrente` boolean DEFAULT false,
	`intervaloRecorrencia` enum('diario','semanal','mensal'),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `timeline_lembretes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `timeline_comentario_templates` ADD CONSTRAINT `timeline_comentario_templates_condominioId_condominios_id_fk` FOREIGN KEY (`condominioId`) REFERENCES `condominios`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `timeline_comentario_templates` ADD CONSTRAINT `timeline_comentario_templates_usuarioId_users_id_fk` FOREIGN KEY (`usuarioId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `timeline_lembretes` ADD CONSTRAINT `timeline_lembretes_usuarioId_users_id_fk` FOREIGN KEY (`usuarioId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `timeline_lembretes` ADD CONSTRAINT `timeline_lembretes_condominioId_condominios_id_fk` FOREIGN KEY (`condominioId`) REFERENCES `condominios`(`id`) ON DELETE no action ON UPDATE no action;