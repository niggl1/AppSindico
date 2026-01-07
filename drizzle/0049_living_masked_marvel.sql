CREATE TABLE `ordens_servico` (
	`id` int AUTO_INCREMENT NOT NULL,
	`condominioId` int NOT NULL,
	`protocolo` varchar(10) NOT NULL,
	`titulo` varchar(255) NOT NULL,
	`descricao` text,
	`categoriaId` int,
	`prioridadeId` int,
	`statusId` int,
	`setorId` int,
	`endereco` text,
	`latitude` varchar(20),
	`longitude` varchar(20),
	`localizacaoDescricao` varchar(255),
	`tempoEstimadoDias` int DEFAULT 0,
	`tempoEstimadoHoras` int DEFAULT 0,
	`tempoEstimadoMinutos` int DEFAULT 0,
	`dataInicio` timestamp,
	`dataFim` timestamp,
	`tempoDecorridoMinutos` int,
	`valorEstimado` decimal(10,2),
	`valorReal` decimal(10,2),
	`manutencaoId` int,
	`chatToken` varchar(64),
	`chatAtivo` boolean DEFAULT true,
	`solicitanteId` int,
	`solicitanteNome` varchar(255),
	`solicitanteTipo` enum('sindico','morador','funcionario','administradora') DEFAULT 'sindico',
	`shareToken` varchar(64),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `ordens_servico_id` PRIMARY KEY(`id`),
	CONSTRAINT `ordens_servico_chatToken_unique` UNIQUE(`chatToken`),
	CONSTRAINT `ordens_servico_shareToken_unique` UNIQUE(`shareToken`)
);
--> statement-breakpoint
CREATE TABLE `os_categorias` (
	`id` int AUTO_INCREMENT NOT NULL,
	`condominioId` int NOT NULL,
	`nome` varchar(100) NOT NULL,
	`descricao` text,
	`icone` varchar(50),
	`cor` varchar(20),
	`isPadrao` boolean DEFAULT false,
	`ativo` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `os_categorias_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `os_chat` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ordemServicoId` int NOT NULL,
	`remetenteId` int,
	`remetenteNome` varchar(255) NOT NULL,
	`remetenteTipo` enum('sindico','morador','funcionario','visitante') DEFAULT 'visitante',
	`mensagem` text NOT NULL,
	`anexoUrl` text,
	`lida` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `os_chat_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `os_configuracoes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`condominioId` int NOT NULL,
	`habilitarOrcamentos` boolean DEFAULT true,
	`habilitarAprovacaoOrcamento` boolean DEFAULT true,
	`habilitarGestaoFinanceira` boolean DEFAULT true,
	`habilitarRelatoriosGastos` boolean DEFAULT true,
	`habilitarVinculoManutencao` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `os_configuracoes_id` PRIMARY KEY(`id`),
	CONSTRAINT `os_configuracoes_condominioId_unique` UNIQUE(`condominioId`)
);
--> statement-breakpoint
CREATE TABLE `os_imagens` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ordemServicoId` int NOT NULL,
	`url` text NOT NULL,
	`tipo` enum('antes','durante','depois','orcamento','outro') DEFAULT 'outro',
	`descricao` varchar(255),
	`ordem` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `os_imagens_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `os_materiais` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ordemServicoId` int NOT NULL,
	`nome` varchar(255) NOT NULL,
	`descricao` text,
	`quantidade` int DEFAULT 1,
	`unidade` varchar(20),
	`emEstoque` boolean DEFAULT false,
	`precisaPedir` boolean DEFAULT false,
	`pedidoDescricao` text,
	`valorUnitario` decimal(10,2),
	`valorTotal` decimal(10,2),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `os_materiais_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `os_orcamentos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ordemServicoId` int NOT NULL,
	`fornecedor` varchar(255),
	`descricao` text,
	`valor` decimal(10,2) NOT NULL,
	`dataOrcamento` timestamp DEFAULT (now()),
	`dataValidade` timestamp,
	`aprovado` boolean DEFAULT false,
	`aprovadoPor` int,
	`dataAprovacao` timestamp,
	`motivoRejeicao` text,
	`anexoUrl` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `os_orcamentos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `os_prioridades` (
	`id` int AUTO_INCREMENT NOT NULL,
	`condominioId` int NOT NULL,
	`nome` varchar(100) NOT NULL,
	`nivel` int DEFAULT 1,
	`cor` varchar(20),
	`icone` varchar(50),
	`isPadrao` boolean DEFAULT false,
	`ativo` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `os_prioridades_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `os_responsaveis` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ordemServicoId` int NOT NULL,
	`nome` varchar(255) NOT NULL,
	`cargo` varchar(100),
	`telefone` varchar(20),
	`email` varchar(255),
	`funcionarioId` int,
	`principal` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `os_responsaveis_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `os_setores` (
	`id` int AUTO_INCREMENT NOT NULL,
	`condominioId` int NOT NULL,
	`nome` varchar(100) NOT NULL,
	`descricao` text,
	`ativo` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `os_setores_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `os_status` (
	`id` int AUTO_INCREMENT NOT NULL,
	`condominioId` int NOT NULL,
	`nome` varchar(100) NOT NULL,
	`cor` varchar(20),
	`icone` varchar(50),
	`ordem` int DEFAULT 0,
	`isFinal` boolean DEFAULT false,
	`isPadrao` boolean DEFAULT false,
	`ativo` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `os_status_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `os_timeline` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ordemServicoId` int NOT NULL,
	`tipo` enum('criacao','status_alterado','responsavel_adicionado','responsavel_removido','material_adicionado','material_removido','orcamento_adicionado','orcamento_aprovado','orcamento_rejeitado','inicio_servico','fim_servico','comentario','foto_adicionada','localizacao_atualizada','vinculo_manutencao') NOT NULL,
	`descricao` text,
	`usuarioId` int,
	`usuarioNome` varchar(255),
	`dadosAnteriores` json,
	`dadosNovos` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `os_timeline_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `ordens_servico` ADD CONSTRAINT `ordens_servico_condominioId_condominios_id_fk` FOREIGN KEY (`condominioId`) REFERENCES `condominios`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ordens_servico` ADD CONSTRAINT `ordens_servico_categoriaId_os_categorias_id_fk` FOREIGN KEY (`categoriaId`) REFERENCES `os_categorias`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ordens_servico` ADD CONSTRAINT `ordens_servico_prioridadeId_os_prioridades_id_fk` FOREIGN KEY (`prioridadeId`) REFERENCES `os_prioridades`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ordens_servico` ADD CONSTRAINT `ordens_servico_statusId_os_status_id_fk` FOREIGN KEY (`statusId`) REFERENCES `os_status`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ordens_servico` ADD CONSTRAINT `ordens_servico_setorId_os_setores_id_fk` FOREIGN KEY (`setorId`) REFERENCES `os_setores`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ordens_servico` ADD CONSTRAINT `ordens_servico_manutencaoId_manutencoes_id_fk` FOREIGN KEY (`manutencaoId`) REFERENCES `manutencoes`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ordens_servico` ADD CONSTRAINT `ordens_servico_solicitanteId_users_id_fk` FOREIGN KEY (`solicitanteId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `os_categorias` ADD CONSTRAINT `os_categorias_condominioId_condominios_id_fk` FOREIGN KEY (`condominioId`) REFERENCES `condominios`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `os_chat` ADD CONSTRAINT `os_chat_ordemServicoId_ordens_servico_id_fk` FOREIGN KEY (`ordemServicoId`) REFERENCES `ordens_servico`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `os_chat` ADD CONSTRAINT `os_chat_remetenteId_users_id_fk` FOREIGN KEY (`remetenteId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `os_configuracoes` ADD CONSTRAINT `os_configuracoes_condominioId_condominios_id_fk` FOREIGN KEY (`condominioId`) REFERENCES `condominios`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `os_imagens` ADD CONSTRAINT `os_imagens_ordemServicoId_ordens_servico_id_fk` FOREIGN KEY (`ordemServicoId`) REFERENCES `ordens_servico`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `os_materiais` ADD CONSTRAINT `os_materiais_ordemServicoId_ordens_servico_id_fk` FOREIGN KEY (`ordemServicoId`) REFERENCES `ordens_servico`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `os_orcamentos` ADD CONSTRAINT `os_orcamentos_ordemServicoId_ordens_servico_id_fk` FOREIGN KEY (`ordemServicoId`) REFERENCES `ordens_servico`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `os_orcamentos` ADD CONSTRAINT `os_orcamentos_aprovadoPor_users_id_fk` FOREIGN KEY (`aprovadoPor`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `os_prioridades` ADD CONSTRAINT `os_prioridades_condominioId_condominios_id_fk` FOREIGN KEY (`condominioId`) REFERENCES `condominios`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `os_responsaveis` ADD CONSTRAINT `os_responsaveis_ordemServicoId_ordens_servico_id_fk` FOREIGN KEY (`ordemServicoId`) REFERENCES `ordens_servico`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `os_responsaveis` ADD CONSTRAINT `os_responsaveis_funcionarioId_funcionarios_id_fk` FOREIGN KEY (`funcionarioId`) REFERENCES `funcionarios`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `os_setores` ADD CONSTRAINT `os_setores_condominioId_condominios_id_fk` FOREIGN KEY (`condominioId`) REFERENCES `condominios`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `os_status` ADD CONSTRAINT `os_status_condominioId_condominios_id_fk` FOREIGN KEY (`condominioId`) REFERENCES `condominios`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `os_timeline` ADD CONSTRAINT `os_timeline_ordemServicoId_ordens_servico_id_fk` FOREIGN KEY (`ordemServicoId`) REFERENCES `ordens_servico`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `os_timeline` ADD CONSTRAINT `os_timeline_usuarioId_users_id_fk` FOREIGN KEY (`usuarioId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;