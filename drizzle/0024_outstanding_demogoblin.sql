CREATE TABLE `configuracoes_email` (
	`id` int AUTO_INCREMENT NOT NULL,
	`condominioId` int NOT NULL,
	`provedor` enum('resend','sendgrid','mailgun','smtp') DEFAULT 'resend',
	`apiKey` text,
	`emailRemetente` varchar(255),
	`nomeRemetente` varchar(255),
	`ativo` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `configuracoes_email_id` PRIMARY KEY(`id`),
	CONSTRAINT `configuracoes_email_condominioId_unique` UNIQUE(`condominioId`)
);
--> statement-breakpoint
CREATE TABLE `historico_notificacoes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`condominioId` int NOT NULL,
	`tipo` enum('push','email','whatsapp','sistema') NOT NULL,
	`titulo` varchar(255) NOT NULL,
	`mensagem` text,
	`destinatarios` int DEFAULT 0,
	`sucessos` int DEFAULT 0,
	`falhas` int DEFAULT 0,
	`lembreteId` int,
	`enviadoPor` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `historico_notificacoes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `lembretes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`condominioId` int NOT NULL,
	`tipo` enum('assembleia','vencimento','evento','manutencao','custom') NOT NULL,
	`titulo` varchar(255) NOT NULL,
	`mensagem` text,
	`dataAgendada` timestamp NOT NULL,
	`antecedenciaHoras` int DEFAULT 24,
	`enviado` boolean DEFAULT false,
	`enviadoEm` timestamp,
	`referenciaId` int,
	`referenciaTipo` varchar(50),
	`canais` json DEFAULT ('["push","email"]'),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `lembretes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `push_subscriptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`condominioId` int,
	`moradorId` int,
	`userId` int,
	`endpoint` text NOT NULL,
	`p256dh` text NOT NULL,
	`auth` text NOT NULL,
	`userAgent` text,
	`ativo` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `push_subscriptions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `configuracoes_email` ADD CONSTRAINT `configuracoes_email_condominioId_condominios_id_fk` FOREIGN KEY (`condominioId`) REFERENCES `condominios`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `historico_notificacoes` ADD CONSTRAINT `historico_notificacoes_condominioId_condominios_id_fk` FOREIGN KEY (`condominioId`) REFERENCES `condominios`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `historico_notificacoes` ADD CONSTRAINT `historico_notificacoes_lembreteId_lembretes_id_fk` FOREIGN KEY (`lembreteId`) REFERENCES `lembretes`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `historico_notificacoes` ADD CONSTRAINT `historico_notificacoes_enviadoPor_users_id_fk` FOREIGN KEY (`enviadoPor`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `lembretes` ADD CONSTRAINT `lembretes_condominioId_condominios_id_fk` FOREIGN KEY (`condominioId`) REFERENCES `condominios`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `push_subscriptions` ADD CONSTRAINT `push_subscriptions_condominioId_condominios_id_fk` FOREIGN KEY (`condominioId`) REFERENCES `condominios`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `push_subscriptions` ADD CONSTRAINT `push_subscriptions_moradorId_moradores_id_fk` FOREIGN KEY (`moradorId`) REFERENCES `moradores`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `push_subscriptions` ADD CONSTRAINT `push_subscriptions_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;