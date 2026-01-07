CREATE TABLE `notificacoes_infracao` (
	`id` int AUTO_INCREMENT NOT NULL,
	`condominioId` int NOT NULL,
	`moradorId` int NOT NULL,
	`tipoInfracaoId` int,
	`titulo` varchar(255) NOT NULL,
	`descricao` text NOT NULL,
	`imagens` json,
	`status` enum('pendente','respondida','resolvida','arquivada') DEFAULT 'pendente',
	`dataOcorrencia` timestamp,
	`pdfUrl` text,
	`linkPublico` varchar(64) NOT NULL,
	`enviadoWhatsapp` boolean DEFAULT false,
	`enviadoEmail` boolean DEFAULT false,
	`criadoPor` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `notificacoes_infracao_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `respostas_infracao` (
	`id` int AUTO_INCREMENT NOT NULL,
	`notificacaoId` int NOT NULL,
	`autorTipo` enum('sindico','morador') NOT NULL,
	`autorId` int,
	`autorNome` varchar(255) NOT NULL,
	`mensagem` text NOT NULL,
	`imagens` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `respostas_infracao_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tipos_infracao` (
	`id` int AUTO_INCREMENT NOT NULL,
	`condominioId` int NOT NULL,
	`titulo` varchar(255) NOT NULL,
	`descricaoPadrao` text,
	`ativo` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tipos_infracao_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `notificacoes_infracao` ADD CONSTRAINT `notificacoes_infracao_condominioId_condominios_id_fk` FOREIGN KEY (`condominioId`) REFERENCES `condominios`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `notificacoes_infracao` ADD CONSTRAINT `notificacoes_infracao_moradorId_moradores_id_fk` FOREIGN KEY (`moradorId`) REFERENCES `moradores`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `notificacoes_infracao` ADD CONSTRAINT `notificacoes_infracao_tipoInfracaoId_tipos_infracao_id_fk` FOREIGN KEY (`tipoInfracaoId`) REFERENCES `tipos_infracao`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `notificacoes_infracao` ADD CONSTRAINT `notificacoes_infracao_criadoPor_users_id_fk` FOREIGN KEY (`criadoPor`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `respostas_infracao` ADD CONSTRAINT `respostas_infracao_notificacaoId_notificacoes_infracao_id_fk` FOREIGN KEY (`notificacaoId`) REFERENCES `notificacoes_infracao`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tipos_infracao` ADD CONSTRAINT `tipos_infracao_condominioId_condominios_id_fk` FOREIGN KEY (`condominioId`) REFERENCES `condominios`(`id`) ON DELETE no action ON UPDATE no action;