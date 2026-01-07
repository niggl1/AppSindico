CREATE TABLE `dicas_seguranca` (
	`id` int AUTO_INCREMENT NOT NULL,
	`condominioId` int,
	`titulo` varchar(255) NOT NULL,
	`conteudo` text NOT NULL,
	`categoria` enum('geral','incendio','roubo','criancas','idosos','digital','veiculos') DEFAULT 'geral',
	`icone` varchar(50) DEFAULT 'shield',
	`ativo` boolean DEFAULT true,
	`ordem` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `dicas_seguranca_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `regras_normas` (
	`id` int AUTO_INCREMENT NOT NULL,
	`condominioId` int,
	`titulo` varchar(255) NOT NULL,
	`conteudo` text NOT NULL,
	`categoria` enum('geral','convivencia','areas_comuns','animais','barulho','estacionamento','mudancas','obras','piscina','salao_festas') DEFAULT 'geral',
	`ativo` boolean DEFAULT true,
	`ordem` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `regras_normas_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `dicas_seguranca` ADD CONSTRAINT `dicas_seguranca_condominioId_condominios_id_fk` FOREIGN KEY (`condominioId`) REFERENCES `condominios`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `regras_normas` ADD CONSTRAINT `regras_normas_condominioId_condominios_id_fk` FOREIGN KEY (`condominioId`) REFERENCES `condominios`(`id`) ON DELETE no action ON UPDATE no action;