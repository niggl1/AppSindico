CREATE TABLE `aquisicoes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`revistaId` int NOT NULL,
	`titulo` varchar(255) NOT NULL,
	`descricao` text,
	`imagemUrl` text,
	`valor` varchar(50),
	`fornecedor` varchar(255),
	`dataAquisicao` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `aquisicoes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `melhorias` (
	`id` int AUTO_INCREMENT NOT NULL,
	`revistaId` int NOT NULL,
	`titulo` varchar(255) NOT NULL,
	`descricao` text,
	`imagemUrl` text,
	`custo` varchar(50),
	`dataImplementacao` timestamp,
	`status` enum('planejada','em_andamento','concluida') DEFAULT 'planejada',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `melhorias_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `realizacoes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`revistaId` int NOT NULL,
	`titulo` varchar(255) NOT NULL,
	`descricao` text,
	`imagemUrl` text,
	`dataRealizacao` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `realizacoes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `aquisicoes` ADD CONSTRAINT `aquisicoes_revistaId_revistas_id_fk` FOREIGN KEY (`revistaId`) REFERENCES `revistas`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `melhorias` ADD CONSTRAINT `melhorias_revistaId_revistas_id_fk` FOREIGN KEY (`revistaId`) REFERENCES `revistas`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `realizacoes` ADD CONSTRAINT `realizacoes_revistaId_revistas_id_fk` FOREIGN KEY (`revistaId`) REFERENCES `revistas`(`id`) ON DELETE no action ON UPDATE no action;