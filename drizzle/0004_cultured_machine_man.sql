CREATE TABLE `timeline_comentario_historico` (
	`id` int AUTO_INCREMENT NOT NULL,
	`comentarioId` int NOT NULL,
	`textoAnterior` text NOT NULL,
	`imagensUrlsAnterior` json,
	`arquivosUrlsAnterior` json,
	`mencoesAnterior` json,
	`editadoPorId` int,
	`editadoPorNome` varchar(255),
	`versao` int DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `timeline_comentario_historico_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `timeline_comentario_historico` ADD CONSTRAINT `timeline_comentario_historico_editadoPorId_users_id_fk` FOREIGN KEY (`editadoPorId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;