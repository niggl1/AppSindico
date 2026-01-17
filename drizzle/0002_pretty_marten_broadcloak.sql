CREATE TABLE `timeline_comentario_reacoes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`comentarioId` int NOT NULL,
	`usuarioId` int,
	`membroEquipeId` int,
	`autorNome` varchar(255) NOT NULL,
	`tipo` enum('like','love','check','question','alert') DEFAULT 'like',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `timeline_comentario_reacoes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `timeline_comentarios` (
	`id` int AUTO_INCREMENT NOT NULL,
	`timelineId` int NOT NULL,
	`membroEquipeId` int,
	`usuarioId` int,
	`autorNome` varchar(255) NOT NULL,
	`autorEmail` varchar(320),
	`autorAvatar` text,
	`texto` text NOT NULL,
	`imagensUrls` json,
	`comentarioPaiId` int,
	`editado` boolean DEFAULT false,
	`dataEdicao` timestamp,
	`excluido` boolean DEFAULT false,
	`dataExclusao` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `timeline_comentarios_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `timeline_comentario_reacoes` ADD CONSTRAINT `timeline_comentario_reacoes_usuarioId_users_id_fk` FOREIGN KEY (`usuarioId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `timeline_comentarios` ADD CONSTRAINT `timeline_comentarios_usuarioId_users_id_fk` FOREIGN KEY (`usuarioId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;