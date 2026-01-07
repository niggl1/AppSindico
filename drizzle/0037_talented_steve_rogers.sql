CREATE TABLE `condominio_funcoes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`condominioId` int NOT NULL,
	`funcaoId` varchar(50) NOT NULL,
	`habilitada` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `condominio_funcoes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `condominio_funcoes` ADD CONSTRAINT `condominio_funcoes_condominioId_condominios_id_fk` FOREIGN KEY (`condominioId`) REFERENCES `condominios`(`id`) ON DELETE no action ON UPDATE no action;