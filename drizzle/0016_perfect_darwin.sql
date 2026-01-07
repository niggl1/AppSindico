CREATE TABLE `historico_compartilhamentos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`linkId` int NOT NULL,
	`membroId` int,
	`membroNome` varchar(255),
	`membroWhatsapp` varchar(20),
	`compartilhadoPorId` int,
	`compartilhadoPorNome` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `historico_compartilhamentos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `links_compartilhaveis` (
	`id` int AUTO_INCREMENT NOT NULL,
	`condominioId` int NOT NULL,
	`tipo` enum('vistoria','manutencao','ocorrencia','checklist') NOT NULL,
	`itemId` int NOT NULL,
	`token` varchar(64) NOT NULL,
	`editavel` boolean NOT NULL DEFAULT false,
	`expiracaoHoras` int DEFAULT 168,
	`acessos` int NOT NULL DEFAULT 0,
	`criadoPorId` int,
	`criadoPorNome` varchar(255),
	`ativo` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `links_compartilhaveis_id` PRIMARY KEY(`id`),
	CONSTRAINT `links_compartilhaveis_token_unique` UNIQUE(`token`)
);
--> statement-breakpoint
CREATE TABLE `membros_equipe` (
	`id` int AUTO_INCREMENT NOT NULL,
	`condominioId` int NOT NULL,
	`nome` varchar(255) NOT NULL,
	`whatsapp` varchar(20) NOT NULL,
	`descricao` text,
	`cargo` varchar(100),
	`fotoUrl` text,
	`ativo` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `membros_equipe_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `historico_compartilhamentos` ADD CONSTRAINT `historico_compartilhamentos_linkId_links_compartilhaveis_id_fk` FOREIGN KEY (`linkId`) REFERENCES `links_compartilhaveis`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `historico_compartilhamentos` ADD CONSTRAINT `historico_compartilhamentos_membroId_membros_equipe_id_fk` FOREIGN KEY (`membroId`) REFERENCES `membros_equipe`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `historico_compartilhamentos` ADD CONSTRAINT `historico_compartilhamentos_compartilhadoPorId_users_id_fk` FOREIGN KEY (`compartilhadoPorId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `links_compartilhaveis` ADD CONSTRAINT `links_compartilhaveis_condominioId_condominios_id_fk` FOREIGN KEY (`condominioId`) REFERENCES `condominios`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `links_compartilhaveis` ADD CONSTRAINT `links_compartilhaveis_criadoPorId_users_id_fk` FOREIGN KEY (`criadoPorId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `membros_equipe` ADD CONSTRAINT `membros_equipe_condominioId_condominios_id_fk` FOREIGN KEY (`condominioId`) REFERENCES `condominios`(`id`) ON DELETE no action ON UPDATE no action;