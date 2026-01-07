CREATE TABLE `albuns` (
	`id` int AUTO_INCREMENT NOT NULL,
	`condominioId` int NOT NULL,
	`titulo` varchar(255) NOT NULL,
	`descricao` text,
	`categoria` enum('eventos','obras','areas_comuns','melhorias','outros') NOT NULL DEFAULT 'outros',
	`capaUrl` text,
	`dataEvento` timestamp,
	`destaque` boolean DEFAULT false,
	`ativo` boolean DEFAULT true,
	`ordem` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `albuns_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `fotos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`albumId` int NOT NULL,
	`url` text NOT NULL,
	`legenda` varchar(500),
	`ordem` int DEFAULT 0,
	`largura` int,
	`altura` int,
	`tamanho` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `fotos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `albuns` ADD CONSTRAINT `albuns_condominioId_condominios_id_fk` FOREIGN KEY (`condominioId`) REFERENCES `condominios`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `fotos` ADD CONSTRAINT `fotos_albumId_albuns_id_fk` FOREIGN KEY (`albumId`) REFERENCES `albuns`(`id`) ON DELETE no action ON UPDATE no action;