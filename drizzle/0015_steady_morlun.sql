CREATE TABLE `checklist_imagens` (
	`id` int AUTO_INCREMENT NOT NULL,
	`checklistId` int NOT NULL,
	`url` text NOT NULL,
	`legenda` varchar(255),
	`ordem` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `checklist_imagens_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `checklist_itens` (
	`id` int AUTO_INCREMENT NOT NULL,
	`checklistId` int NOT NULL,
	`descricao` varchar(500) NOT NULL,
	`completo` boolean DEFAULT false,
	`observacao` text,
	`ordem` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `checklist_itens_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `checklist_timeline` (
	`id` int AUTO_INCREMENT NOT NULL,
	`checklistId` int NOT NULL,
	`tipo` enum('abertura','atualizacao','status_alterado','comentario','imagem_adicionada','responsavel_alterado','item_completo','fechamento','reabertura') NOT NULL,
	`descricao` text NOT NULL,
	`statusAnterior` varchar(50),
	`statusNovo` varchar(50),
	`userId` int,
	`userNome` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `checklist_timeline_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `checklists` (
	`id` int AUTO_INCREMENT NOT NULL,
	`condominioId` int NOT NULL,
	`protocolo` varchar(20) NOT NULL,
	`titulo` varchar(255) NOT NULL,
	`subtitulo` varchar(255),
	`descricao` text,
	`observacoes` text,
	`responsavelId` int,
	`responsavelNome` varchar(255),
	`localizacao` varchar(255),
	`dataAgendada` timestamp,
	`dataRealizada` timestamp,
	`status` enum('pendente','realizada','acao_necessaria','finalizada','reaberta') NOT NULL DEFAULT 'pendente',
	`prioridade` enum('baixa','media','alta','urgente') DEFAULT 'media',
	`categoria` varchar(100),
	`totalItens` int DEFAULT 0,
	`itensCompletos` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `checklists_id` PRIMARY KEY(`id`),
	CONSTRAINT `checklists_protocolo_unique` UNIQUE(`protocolo`)
);
--> statement-breakpoint
CREATE TABLE `manutencao_imagens` (
	`id` int AUTO_INCREMENT NOT NULL,
	`manutencaoId` int NOT NULL,
	`url` text NOT NULL,
	`legenda` varchar(255),
	`ordem` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `manutencao_imagens_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `manutencao_timeline` (
	`id` int AUTO_INCREMENT NOT NULL,
	`manutencaoId` int NOT NULL,
	`tipo` enum('abertura','atualizacao','status_alterado','comentario','imagem_adicionada','responsavel_alterado','fechamento','reabertura') NOT NULL,
	`descricao` text NOT NULL,
	`statusAnterior` varchar(50),
	`statusNovo` varchar(50),
	`userId` int,
	`userNome` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `manutencao_timeline_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `manutencoes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`condominioId` int NOT NULL,
	`protocolo` varchar(20) NOT NULL,
	`titulo` varchar(255) NOT NULL,
	`subtitulo` varchar(255),
	`descricao` text,
	`observacoes` text,
	`responsavelId` int,
	`responsavelNome` varchar(255),
	`localizacao` varchar(255),
	`dataAgendada` timestamp,
	`dataRealizada` timestamp,
	`status` enum('pendente','realizada','acao_necessaria','finalizada','reaberta') NOT NULL DEFAULT 'pendente',
	`prioridade` enum('baixa','media','alta','urgente') DEFAULT 'media',
	`tipo` enum('preventiva','corretiva','emergencial','programada') DEFAULT 'corretiva',
	`custoEstimado` decimal(10,2),
	`custoReal` decimal(10,2),
	`fornecedor` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `manutencoes_id` PRIMARY KEY(`id`),
	CONSTRAINT `manutencoes_protocolo_unique` UNIQUE(`protocolo`)
);
--> statement-breakpoint
CREATE TABLE `ocorrencia_imagens` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ocorrenciaId` int NOT NULL,
	`url` text NOT NULL,
	`legenda` varchar(255),
	`ordem` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `ocorrencia_imagens_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ocorrencia_timeline` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ocorrenciaId` int NOT NULL,
	`tipo` enum('abertura','atualizacao','status_alterado','comentario','imagem_adicionada','responsavel_alterado','fechamento','reabertura') NOT NULL,
	`descricao` text NOT NULL,
	`statusAnterior` varchar(50),
	`statusNovo` varchar(50),
	`userId` int,
	`userNome` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `ocorrencia_timeline_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ocorrencias` (
	`id` int AUTO_INCREMENT NOT NULL,
	`condominioId` int NOT NULL,
	`protocolo` varchar(20) NOT NULL,
	`titulo` varchar(255) NOT NULL,
	`subtitulo` varchar(255),
	`descricao` text,
	`observacoes` text,
	`reportadoPorId` int,
	`reportadoPorNome` varchar(255),
	`responsavelId` int,
	`responsavelNome` varchar(255),
	`localizacao` varchar(255),
	`dataOcorrencia` timestamp,
	`status` enum('pendente','realizada','acao_necessaria','finalizada','reaberta') NOT NULL DEFAULT 'pendente',
	`prioridade` enum('baixa','media','alta','urgente') DEFAULT 'media',
	`categoria` enum('seguranca','barulho','manutencao','convivencia','animais','estacionamento','limpeza','outros') DEFAULT 'outros',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `ocorrencias_id` PRIMARY KEY(`id`),
	CONSTRAINT `ocorrencias_protocolo_unique` UNIQUE(`protocolo`)
);
--> statement-breakpoint
CREATE TABLE `vistoria_imagens` (
	`id` int AUTO_INCREMENT NOT NULL,
	`vistoriaId` int NOT NULL,
	`url` text NOT NULL,
	`legenda` varchar(255),
	`ordem` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `vistoria_imagens_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `vistoria_timeline` (
	`id` int AUTO_INCREMENT NOT NULL,
	`vistoriaId` int NOT NULL,
	`tipo` enum('abertura','atualizacao','status_alterado','comentario','imagem_adicionada','responsavel_alterado','fechamento','reabertura') NOT NULL,
	`descricao` text NOT NULL,
	`statusAnterior` varchar(50),
	`statusNovo` varchar(50),
	`userId` int,
	`userNome` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `vistoria_timeline_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `vistorias` (
	`id` int AUTO_INCREMENT NOT NULL,
	`condominioId` int NOT NULL,
	`protocolo` varchar(20) NOT NULL,
	`titulo` varchar(255) NOT NULL,
	`subtitulo` varchar(255),
	`descricao` text,
	`observacoes` text,
	`responsavelId` int,
	`responsavelNome` varchar(255),
	`localizacao` varchar(255),
	`dataAgendada` timestamp,
	`dataRealizada` timestamp,
	`status` enum('pendente','realizada','acao_necessaria','finalizada','reaberta') NOT NULL DEFAULT 'pendente',
	`prioridade` enum('baixa','media','alta','urgente') DEFAULT 'media',
	`tipo` varchar(100),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `vistorias_id` PRIMARY KEY(`id`),
	CONSTRAINT `vistorias_protocolo_unique` UNIQUE(`protocolo`)
);
--> statement-breakpoint
ALTER TABLE `checklist_imagens` ADD CONSTRAINT `checklist_imagens_checklistId_checklists_id_fk` FOREIGN KEY (`checklistId`) REFERENCES `checklists`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `checklist_itens` ADD CONSTRAINT `checklist_itens_checklistId_checklists_id_fk` FOREIGN KEY (`checklistId`) REFERENCES `checklists`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `checklist_timeline` ADD CONSTRAINT `checklist_timeline_checklistId_checklists_id_fk` FOREIGN KEY (`checklistId`) REFERENCES `checklists`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `checklist_timeline` ADD CONSTRAINT `checklist_timeline_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `checklists` ADD CONSTRAINT `checklists_condominioId_condominios_id_fk` FOREIGN KEY (`condominioId`) REFERENCES `condominios`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `checklists` ADD CONSTRAINT `checklists_responsavelId_users_id_fk` FOREIGN KEY (`responsavelId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `manutencao_imagens` ADD CONSTRAINT `manutencao_imagens_manutencaoId_manutencoes_id_fk` FOREIGN KEY (`manutencaoId`) REFERENCES `manutencoes`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `manutencao_timeline` ADD CONSTRAINT `manutencao_timeline_manutencaoId_manutencoes_id_fk` FOREIGN KEY (`manutencaoId`) REFERENCES `manutencoes`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `manutencao_timeline` ADD CONSTRAINT `manutencao_timeline_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `manutencoes` ADD CONSTRAINT `manutencoes_condominioId_condominios_id_fk` FOREIGN KEY (`condominioId`) REFERENCES `condominios`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `manutencoes` ADD CONSTRAINT `manutencoes_responsavelId_users_id_fk` FOREIGN KEY (`responsavelId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ocorrencia_imagens` ADD CONSTRAINT `ocorrencia_imagens_ocorrenciaId_ocorrencias_id_fk` FOREIGN KEY (`ocorrenciaId`) REFERENCES `ocorrencias`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ocorrencia_timeline` ADD CONSTRAINT `ocorrencia_timeline_ocorrenciaId_ocorrencias_id_fk` FOREIGN KEY (`ocorrenciaId`) REFERENCES `ocorrencias`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ocorrencia_timeline` ADD CONSTRAINT `ocorrencia_timeline_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ocorrencias` ADD CONSTRAINT `ocorrencias_condominioId_condominios_id_fk` FOREIGN KEY (`condominioId`) REFERENCES `condominios`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ocorrencias` ADD CONSTRAINT `ocorrencias_reportadoPorId_users_id_fk` FOREIGN KEY (`reportadoPorId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ocorrencias` ADD CONSTRAINT `ocorrencias_responsavelId_users_id_fk` FOREIGN KEY (`responsavelId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `vistoria_imagens` ADD CONSTRAINT `vistoria_imagens_vistoriaId_vistorias_id_fk` FOREIGN KEY (`vistoriaId`) REFERENCES `vistorias`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `vistoria_timeline` ADD CONSTRAINT `vistoria_timeline_vistoriaId_vistorias_id_fk` FOREIGN KEY (`vistoriaId`) REFERENCES `vistorias`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `vistoria_timeline` ADD CONSTRAINT `vistoria_timeline_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `vistorias` ADD CONSTRAINT `vistorias_condominioId_condominios_id_fk` FOREIGN KEY (`condominioId`) REFERENCES `condominios`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `vistorias` ADD CONSTRAINT `vistorias_responsavelId_users_id_fk` FOREIGN KEY (`responsavelId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;