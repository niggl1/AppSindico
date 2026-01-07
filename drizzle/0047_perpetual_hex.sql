CREATE TABLE `valores_salvos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`condominioId` int NOT NULL,
	`tipo` enum('responsavel','categoria_vistoria','categoria_manutencao','categoria_checklist','categoria_ocorrencia','tipo_vistoria','tipo_manutencao','tipo_checklist','tipo_ocorrencia','fornecedor','localizacao') NOT NULL,
	`valor` varchar(255) NOT NULL,
	`ativo` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `valores_salvos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `valores_salvos` ADD CONSTRAINT `valores_salvos_condominioId_condominios_id_fk` FOREIGN KEY (`condominioId`) REFERENCES `condominios`(`id`) ON DELETE no action ON UPDATE no action;