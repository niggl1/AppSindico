CREATE TABLE `checklist_template_itens` (
	`id` int AUTO_INCREMENT NOT NULL,
	`templateId` int NOT NULL,
	`descricao` varchar(500) NOT NULL,
	`ordem` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `checklist_template_itens_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `checklist_templates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`condominioId` int,
	`nome` varchar(255) NOT NULL,
	`descricao` text,
	`categoria` varchar(100),
	`icone` varchar(50),
	`cor` varchar(20),
	`isPadrao` boolean DEFAULT false,
	`ativo` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `checklist_templates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `checklist_template_itens` ADD CONSTRAINT `checklist_template_itens_templateId_checklist_templates_id_fk` FOREIGN KEY (`templateId`) REFERENCES `checklist_templates`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `checklist_templates` ADD CONSTRAINT `checklist_templates_condominioId_condominios_id_fk` FOREIGN KEY (`condominioId`) REFERENCES `condominios`(`id`) ON DELETE no action ON UPDATE no action;