CREATE TABLE `funcionario_apps` (
	`id` int AUTO_INCREMENT NOT NULL,
	`funcionarioId` int NOT NULL,
	`appId` int NOT NULL,
	`ativo` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `funcionario_apps_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `funcionario_condominios` (
	`id` int AUTO_INCREMENT NOT NULL,
	`funcionarioId` int NOT NULL,
	`condominioId` int NOT NULL,
	`ativo` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `funcionario_condominios_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `funcionarios` ADD `tipoFuncionario` enum('zelador','porteiro','supervisor','gerente','auxiliar','sindico_externo') DEFAULT 'auxiliar';--> statement-breakpoint
ALTER TABLE `funcionario_apps` ADD CONSTRAINT `funcionario_apps_funcionarioId_funcionarios_id_fk` FOREIGN KEY (`funcionarioId`) REFERENCES `funcionarios`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `funcionario_apps` ADD CONSTRAINT `funcionario_apps_appId_apps_id_fk` FOREIGN KEY (`appId`) REFERENCES `apps`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `funcionario_condominios` ADD CONSTRAINT `funcionario_condominios_funcionarioId_funcionarios_id_fk` FOREIGN KEY (`funcionarioId`) REFERENCES `funcionarios`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `funcionario_condominios` ADD CONSTRAINT `funcionario_condominios_condominioId_condominios_id_fk` FOREIGN KEY (`condominioId`) REFERENCES `condominios`(`id`) ON DELETE no action ON UPDATE no action;