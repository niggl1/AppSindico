CREATE TABLE `revista_versoes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`revistaId` int NOT NULL,
	`versao` int NOT NULL,
	`titulo` varchar(255) NOT NULL,
	`subtitulo` varchar(500),
	`edicao` varchar(100),
	`mesAno` varchar(50),
	`imagemCapaUrl` varchar(500),
	`corFundo` varchar(50),
	`estiloPdf` varchar(50),
	`secoes` json,
	`descricaoAlteracao` text,
	`tipoAlteracao` enum('criacao','edicao','publicacao','restauracao') DEFAULT 'edicao',
	`criadoPor` int,
	`criadoPorNome` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `revista_versoes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `revista_versoes` ADD CONSTRAINT `revista_versoes_revistaId_revistas_id_fk` FOREIGN KEY (`revistaId`) REFERENCES `revistas`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `revista_versoes` ADD CONSTRAINT `revista_versoes_criadoPor_users_id_fk` FOREIGN KEY (`criadoPor`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;