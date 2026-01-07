CREATE TABLE `funcoes_rapidas` (
	`id` int AUTO_INCREMENT NOT NULL,
	`condominioId` int NOT NULL,
	`funcaoId` varchar(100) NOT NULL,
	`nome` varchar(255) NOT NULL,
	`path` varchar(255) NOT NULL,
	`icone` varchar(100) NOT NULL,
	`cor` varchar(20) NOT NULL,
	`ordem` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `funcoes_rapidas_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `funcoes_rapidas` ADD CONSTRAINT `funcoes_rapidas_condominioId_condominios_id_fk` FOREIGN KEY (`condominioId`) REFERENCES `condominios`(`id`) ON DELETE no action ON UPDATE no action;