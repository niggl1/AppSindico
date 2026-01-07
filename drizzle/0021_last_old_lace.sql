CREATE TABLE `vencimento_alertas` (
	`id` int AUTO_INCREMENT NOT NULL,
	`vencimentoId` int NOT NULL,
	`tipoAlerta` enum('na_data','um_dia_antes','uma_semana_antes','quinze_dias_antes','um_mes_antes') NOT NULL,
	`ativo` boolean DEFAULT true,
	`enviado` boolean DEFAULT false,
	`dataEnvio` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `vencimento_alertas_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `vencimento_emails` (
	`id` int AUTO_INCREMENT NOT NULL,
	`condominioId` int NOT NULL,
	`email` varchar(320) NOT NULL,
	`nome` varchar(255),
	`ativo` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `vencimento_emails_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `vencimento_notificacoes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`vencimentoId` int NOT NULL,
	`alertaId` int,
	`emailDestinatario` varchar(320) NOT NULL,
	`assunto` varchar(255) NOT NULL,
	`conteudo` text NOT NULL,
	`status` enum('enviado','erro','pendente') NOT NULL DEFAULT 'pendente',
	`erroMensagem` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `vencimento_notificacoes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `vencimentos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`condominioId` int NOT NULL,
	`tipo` enum('contrato','servico','manutencao') NOT NULL,
	`titulo` varchar(255) NOT NULL,
	`descricao` text,
	`fornecedor` varchar(255),
	`valor` decimal(10,2),
	`dataInicio` timestamp,
	`dataVencimento` timestamp NOT NULL,
	`ultimaRealizacao` timestamp,
	`proximaRealizacao` timestamp,
	`periodicidade` enum('unico','mensal','bimestral','trimestral','semestral','anual') DEFAULT 'unico',
	`status` enum('ativo','vencido','renovado','cancelado') NOT NULL DEFAULT 'ativo',
	`observacoes` text,
	`arquivoUrl` text,
	`arquivoNome` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `vencimentos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `vencimento_alertas` ADD CONSTRAINT `vencimento_alertas_vencimentoId_vencimentos_id_fk` FOREIGN KEY (`vencimentoId`) REFERENCES `vencimentos`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `vencimento_emails` ADD CONSTRAINT `vencimento_emails_condominioId_condominios_id_fk` FOREIGN KEY (`condominioId`) REFERENCES `condominios`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `vencimento_notificacoes` ADD CONSTRAINT `vencimento_notificacoes_vencimentoId_vencimentos_id_fk` FOREIGN KEY (`vencimentoId`) REFERENCES `vencimentos`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `vencimento_notificacoes` ADD CONSTRAINT `vencimento_notificacoes_alertaId_vencimento_alertas_id_fk` FOREIGN KEY (`alertaId`) REFERENCES `vencimento_alertas`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `vencimentos` ADD CONSTRAINT `vencimentos_condominioId_condominios_id_fk` FOREIGN KEY (`condominioId`) REFERENCES `condominios`(`id`) ON DELETE no action ON UPDATE no action;