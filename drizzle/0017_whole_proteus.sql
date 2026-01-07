CREATE TABLE `anexos_comentario` (
	`id` int AUTO_INCREMENT NOT NULL,
	`comentarioId` int NOT NULL,
	`url` text NOT NULL,
	`nome` varchar(255) NOT NULL,
	`tipo` varchar(100) NOT NULL,
	`tamanho` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `anexos_comentario_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `comentarios_item` (
	`id` int AUTO_INCREMENT NOT NULL,
	`itemId` int NOT NULL,
	`itemTipo` enum('vistoria','manutencao','ocorrencia','checklist') NOT NULL,
	`condominioId` int NOT NULL,
	`autorId` int,
	`autorNome` varchar(255) NOT NULL,
	`autorWhatsapp` varchar(20),
	`autorEmail` varchar(320),
	`autorFoto` text,
	`texto` text NOT NULL,
	`isInterno` boolean NOT NULL DEFAULT false,
	`lido` boolean NOT NULL DEFAULT false,
	`lidoPorId` int,
	`lidoEm` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `comentarios_item_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `respostas_comentario` (
	`id` int AUTO_INCREMENT NOT NULL,
	`comentarioId` int NOT NULL,
	`autorId` int,
	`autorNome` varchar(255) NOT NULL,
	`autorFoto` text,
	`texto` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `respostas_comentario_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `anexos_comentario` ADD CONSTRAINT `anexos_comentario_comentarioId_comentarios_item_id_fk` FOREIGN KEY (`comentarioId`) REFERENCES `comentarios_item`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `comentarios_item` ADD CONSTRAINT `comentarios_item_condominioId_condominios_id_fk` FOREIGN KEY (`condominioId`) REFERENCES `condominios`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `comentarios_item` ADD CONSTRAINT `comentarios_item_autorId_users_id_fk` FOREIGN KEY (`autorId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `comentarios_item` ADD CONSTRAINT `comentarios_item_lidoPorId_users_id_fk` FOREIGN KEY (`lidoPorId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `respostas_comentario` ADD CONSTRAINT `respostas_comentario_comentarioId_comentarios_item_id_fk` FOREIGN KEY (`comentarioId`) REFERENCES `comentarios_item`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `respostas_comentario` ADD CONSTRAINT `respostas_comentario_autorId_users_id_fk` FOREIGN KEY (`autorId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;