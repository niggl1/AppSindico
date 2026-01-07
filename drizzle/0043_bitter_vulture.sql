CREATE TABLE `app_modulos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`appId` int NOT NULL,
	`moduloKey` varchar(50) NOT NULL,
	`titulo` varchar(100) NOT NULL,
	`icone` varchar(50),
	`cor` varchar(20),
	`bgCor` varchar(20),
	`ordem` int DEFAULT 0,
	`habilitado` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `app_modulos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `apps` (
	`id` int AUTO_INCREMENT NOT NULL,
	`condominioId` int NOT NULL,
	`nome` varchar(255) NOT NULL,
	`descricao` text,
	`logoUrl` text,
	`corPrimaria` varchar(20) DEFAULT '#4F46E5',
	`corSecundaria` varchar(20) DEFAULT '#10B981',
	`ativo` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `apps_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `app_modulos` ADD CONSTRAINT `app_modulos_appId_apps_id_fk` FOREIGN KEY (`appId`) REFERENCES `apps`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `apps` ADD CONSTRAINT `apps_condominioId_condominios_id_fk` FOREIGN KEY (`condominioId`) REFERENCES `condominios`(`id`) ON DELETE no action ON UPDATE no action;