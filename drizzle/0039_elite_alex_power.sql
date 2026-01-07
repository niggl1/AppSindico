CREATE TABLE `funcionario_funcoes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`funcionarioId` int NOT NULL,
	`funcaoKey` varchar(100) NOT NULL,
	`habilitada` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `funcionario_funcoes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `funcionarios` ADD `loginEmail` varchar(255);--> statement-breakpoint
ALTER TABLE `funcionarios` ADD `senha` varchar(255);--> statement-breakpoint
ALTER TABLE `funcionarios` ADD `loginAtivo` boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE `funcionarios` ADD `ultimoLogin` timestamp;--> statement-breakpoint
ALTER TABLE `funcionario_funcoes` ADD CONSTRAINT `funcionario_funcoes_funcionarioId_funcionarios_id_fk` FOREIGN KEY (`funcionarioId`) REFERENCES `funcionarios`(`id`) ON DELETE no action ON UPDATE no action;