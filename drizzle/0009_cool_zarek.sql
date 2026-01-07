CREATE TABLE `comunicados` (
	`id` int AUTO_INCREMENT NOT NULL,
	`revistaId` int NOT NULL,
	`titulo` varchar(255) NOT NULL,
	`descricao` text,
	`anexoUrl` text,
	`anexoNome` varchar(255),
	`anexoTipo` varchar(100),
	`anexoTamanho` int,
	`dataPublicacao` timestamp DEFAULT (now()),
	`destaque` boolean DEFAULT false,
	`ativo` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `comunicados_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `comunicados` ADD CONSTRAINT `comunicados_revistaId_revistas_id_fk` FOREIGN KEY (`revistaId`) REFERENCES `revistas`(`id`) ON DELETE no action ON UPDATE no action;