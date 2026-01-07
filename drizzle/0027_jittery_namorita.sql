CREATE TABLE `templates_notificacao` (
	`id` int AUTO_INCREMENT NOT NULL,
	`condominioId` int NOT NULL,
	`nome` varchar(100) NOT NULL,
	`titulo` varchar(100) NOT NULL,
	`mensagem` text NOT NULL,
	`categoria` enum('assembleia','manutencao','vencimento','aviso','evento','custom') DEFAULT 'custom',
	`icone` varchar(50),
	`cor` varchar(20),
	`urlDestino` varchar(255),
	`ativo` boolean DEFAULT true,
	`usageCount` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `templates_notificacao_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `templates_notificacao` ADD CONSTRAINT `templates_notificacao_condominioId_condominios_id_fk` FOREIGN KEY (`condominioId`) REFERENCES `condominios`(`id`) ON DELETE no action ON UPDATE no action;