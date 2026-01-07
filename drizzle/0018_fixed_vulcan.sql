CREATE TABLE `destaques` (
	`id` int AUTO_INCREMENT NOT NULL,
	`condominioId` int NOT NULL,
	`titulo` varchar(255) NOT NULL,
	`subtitulo` varchar(255),
	`descricao` text,
	`link` text,
	`arquivoUrl` text,
	`arquivoNome` varchar(255),
	`videoUrl` text,
	`ordem` int DEFAULT 0,
	`ativo` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `destaques_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `imagens_destaques` (
	`id` int AUTO_INCREMENT NOT NULL,
	`destaqueId` int NOT NULL,
	`url` text NOT NULL,
	`legenda` varchar(255),
	`ordem` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `imagens_destaques_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `destaques` ADD CONSTRAINT `destaques_condominioId_condominios_id_fk` FOREIGN KEY (`condominioId`) REFERENCES `condominios`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `imagens_destaques` ADD CONSTRAINT `imagens_destaques_destaqueId_destaques_id_fk` FOREIGN KEY (`destaqueId`) REFERENCES `destaques`(`id`) ON DELETE no action ON UPDATE no action;