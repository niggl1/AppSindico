CREATE TABLE `achados_perdidos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`condominioId` int NOT NULL,
	`usuarioId` int NOT NULL,
	`tipo` enum('achado','perdido') NOT NULL,
	`titulo` varchar(255) NOT NULL,
	`descricao` text,
	`fotoUrl` text,
	`localEncontrado` varchar(255),
	`dataOcorrencia` timestamp,
	`status` enum('aberto','resolvido') DEFAULT 'aberto',
	`contato` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `achados_perdidos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `antes_depois` (
	`id` int AUTO_INCREMENT NOT NULL,
	`revistaId` int NOT NULL,
	`titulo` varchar(255) NOT NULL,
	`descricao` text,
	`fotoAntesUrl` text,
	`fotoDepoisUrl` text,
	`dataRealizacao` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `antes_depois_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `avisos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`revistaId` int NOT NULL,
	`titulo` varchar(255) NOT NULL,
	`conteudo` text,
	`tipo` enum('urgente','importante','informativo') DEFAULT 'informativo',
	`imagemUrl` text,
	`destaque` boolean DEFAULT false,
	`dataExpiracao` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `avisos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `caronas` (
	`id` int AUTO_INCREMENT NOT NULL,
	`condominioId` int NOT NULL,
	`usuarioId` int NOT NULL,
	`tipo` enum('oferece','procura') NOT NULL,
	`origem` varchar(255) NOT NULL,
	`destino` varchar(255) NOT NULL,
	`dataCarona` timestamp,
	`horario` varchar(10),
	`vagasDisponiveis` int DEFAULT 1,
	`observacoes` text,
	`status` enum('ativa','concluida','cancelada') DEFAULT 'ativa',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `caronas_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `classificados` (
	`id` int AUTO_INCREMENT NOT NULL,
	`condominioId` int NOT NULL,
	`usuarioId` int NOT NULL,
	`tipo` enum('produto','servico') NOT NULL,
	`titulo` varchar(255) NOT NULL,
	`descricao` text,
	`preco` varchar(50),
	`fotoUrl` text,
	`contato` varchar(255),
	`status` enum('pendente','aprovado','rejeitado','vendido') DEFAULT 'pendente',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `classificados_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `condominios` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nome` varchar(255) NOT NULL,
	`endereco` text,
	`cidade` varchar(100),
	`estado` varchar(50),
	`cep` varchar(10),
	`logoUrl` text,
	`bannerUrl` text,
	`corPrimaria` varchar(20) DEFAULT '#4F46E5',
	`corSecundaria` varchar(20) DEFAULT '#10B981',
	`sindicoId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `condominios_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `eventos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`revistaId` int NOT NULL,
	`titulo` varchar(255) NOT NULL,
	`descricao` text,
	`dataEvento` timestamp,
	`horaInicio` varchar(10),
	`horaFim` varchar(10),
	`local` varchar(255),
	`imagemUrl` text,
	`tipo` enum('agendado','realizado') DEFAULT 'agendado',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `eventos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `funcionarios` (
	`id` int AUTO_INCREMENT NOT NULL,
	`condominioId` int NOT NULL,
	`nome` varchar(255) NOT NULL,
	`cargo` varchar(100),
	`fotoUrl` text,
	`descricao` text,
	`dataAdmissao` timestamp,
	`ativo` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `funcionarios_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `links_uteis` (
	`id` int AUTO_INCREMENT NOT NULL,
	`revistaId` int NOT NULL,
	`titulo` varchar(255) NOT NULL,
	`url` text NOT NULL,
	`descricao` text,
	`icone` varchar(50),
	`ordem` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `links_uteis_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `mensagens_sindico` (
	`id` int AUTO_INCREMENT NOT NULL,
	`revistaId` int NOT NULL,
	`fotoSindicoUrl` text,
	`nomeSindico` varchar(255),
	`titulo` varchar(255),
	`mensagem` text,
	`assinatura` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `mensagens_sindico_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `moradores` (
	`id` int AUTO_INCREMENT NOT NULL,
	`condominioId` int NOT NULL,
	`usuarioId` int,
	`nome` varchar(255) NOT NULL,
	`email` varchar(320),
	`telefone` varchar(20),
	`apartamento` varchar(20),
	`bloco` varchar(20),
	`tipo` enum('proprietario','inquilino') DEFAULT 'proprietario',
	`ativo` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `moradores_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `opcoes_votacao` (
	`id` int AUTO_INCREMENT NOT NULL,
	`votacaoId` int NOT NULL,
	`titulo` varchar(255) NOT NULL,
	`descricao` text,
	`imagemUrl` text,
	`votos` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `opcoes_votacao_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `publicidades` (
	`id` int AUTO_INCREMENT NOT NULL,
	`condominioId` int NOT NULL,
	`anunciante` varchar(255) NOT NULL,
	`titulo` varchar(255) NOT NULL,
	`descricao` text,
	`imagemUrl` text,
	`linkUrl` text,
	`telefone` varchar(20),
	`tipo` enum('banner','destaque','lateral') DEFAULT 'banner',
	`ativo` boolean DEFAULT true,
	`dataInicio` timestamp,
	`dataFim` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `publicidades_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `revistas` (
	`id` int AUTO_INCREMENT NOT NULL,
	`condominioId` int NOT NULL,
	`titulo` varchar(255) NOT NULL,
	`subtitulo` text,
	`edicao` varchar(50),
	`capaUrl` text,
	`templateId` varchar(50) DEFAULT 'default',
	`status` enum('rascunho','publicada','arquivada') NOT NULL DEFAULT 'rascunho',
	`publicadaEm` timestamp,
	`visualizacoes` int DEFAULT 0,
	`shareLink` varchar(100),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `revistas_id` PRIMARY KEY(`id`),
	CONSTRAINT `revistas_shareLink_unique` UNIQUE(`shareLink`)
);
--> statement-breakpoint
CREATE TABLE `secoes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`revistaId` int NOT NULL,
	`tipo` enum('mensagem_sindico','avisos','comunicados','dicas_seguranca','regras','links_uteis','telefones_uteis','realizacoes','antes_depois','melhorias','aquisicoes','funcionarios','agenda_eventos','eventos','achados_perdidos','caronas','vagas_estacionamento','classificados','votacoes','publicidade') NOT NULL,
	`titulo` varchar(255),
	`ordem` int DEFAULT 0,
	`ativo` boolean DEFAULT true,
	`config` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `secoes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `telefones_uteis` (
	`id` int AUTO_INCREMENT NOT NULL,
	`revistaId` int NOT NULL,
	`nome` varchar(255) NOT NULL,
	`telefone` varchar(20) NOT NULL,
	`descricao` text,
	`categoria` varchar(100),
	`ordem` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `telefones_uteis_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `vagas_estacionamento` (
	`id` int AUTO_INCREMENT NOT NULL,
	`condominioId` int NOT NULL,
	`numero` varchar(20) NOT NULL,
	`apartamento` varchar(20),
	`bloco` varchar(20),
	`tipo` enum('coberta','descoberta','moto') DEFAULT 'coberta',
	`observacoes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `vagas_estacionamento_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `votacoes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`revistaId` int NOT NULL,
	`titulo` varchar(255) NOT NULL,
	`descricao` text,
	`tipo` enum('funcionario_mes','enquete','decisao') NOT NULL,
	`imagemUrl` text,
	`arquivoUrl` text,
	`videoUrl` text,
	`dataInicio` timestamp,
	`dataFim` timestamp,
	`status` enum('ativa','encerrada') DEFAULT 'ativa',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `votacoes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `votos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`votacaoId` int NOT NULL,
	`opcaoId` int NOT NULL,
	`usuarioId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `votos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('user','admin','sindico','morador') NOT NULL DEFAULT 'user';--> statement-breakpoint
ALTER TABLE `users` ADD `avatarUrl` text;--> statement-breakpoint
ALTER TABLE `users` ADD `phone` varchar(20);--> statement-breakpoint
ALTER TABLE `users` ADD `apartment` varchar(20);--> statement-breakpoint
ALTER TABLE `achados_perdidos` ADD CONSTRAINT `achados_perdidos_condominioId_condominios_id_fk` FOREIGN KEY (`condominioId`) REFERENCES `condominios`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `achados_perdidos` ADD CONSTRAINT `achados_perdidos_usuarioId_users_id_fk` FOREIGN KEY (`usuarioId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `antes_depois` ADD CONSTRAINT `antes_depois_revistaId_revistas_id_fk` FOREIGN KEY (`revistaId`) REFERENCES `revistas`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `avisos` ADD CONSTRAINT `avisos_revistaId_revistas_id_fk` FOREIGN KEY (`revistaId`) REFERENCES `revistas`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `caronas` ADD CONSTRAINT `caronas_condominioId_condominios_id_fk` FOREIGN KEY (`condominioId`) REFERENCES `condominios`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `caronas` ADD CONSTRAINT `caronas_usuarioId_users_id_fk` FOREIGN KEY (`usuarioId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `classificados` ADD CONSTRAINT `classificados_condominioId_condominios_id_fk` FOREIGN KEY (`condominioId`) REFERENCES `condominios`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `classificados` ADD CONSTRAINT `classificados_usuarioId_users_id_fk` FOREIGN KEY (`usuarioId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `condominios` ADD CONSTRAINT `condominios_sindicoId_users_id_fk` FOREIGN KEY (`sindicoId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `eventos` ADD CONSTRAINT `eventos_revistaId_revistas_id_fk` FOREIGN KEY (`revistaId`) REFERENCES `revistas`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `funcionarios` ADD CONSTRAINT `funcionarios_condominioId_condominios_id_fk` FOREIGN KEY (`condominioId`) REFERENCES `condominios`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `links_uteis` ADD CONSTRAINT `links_uteis_revistaId_revistas_id_fk` FOREIGN KEY (`revistaId`) REFERENCES `revistas`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `mensagens_sindico` ADD CONSTRAINT `mensagens_sindico_revistaId_revistas_id_fk` FOREIGN KEY (`revistaId`) REFERENCES `revistas`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `moradores` ADD CONSTRAINT `moradores_condominioId_condominios_id_fk` FOREIGN KEY (`condominioId`) REFERENCES `condominios`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `moradores` ADD CONSTRAINT `moradores_usuarioId_users_id_fk` FOREIGN KEY (`usuarioId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `opcoes_votacao` ADD CONSTRAINT `opcoes_votacao_votacaoId_votacoes_id_fk` FOREIGN KEY (`votacaoId`) REFERENCES `votacoes`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `publicidades` ADD CONSTRAINT `publicidades_condominioId_condominios_id_fk` FOREIGN KEY (`condominioId`) REFERENCES `condominios`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `revistas` ADD CONSTRAINT `revistas_condominioId_condominios_id_fk` FOREIGN KEY (`condominioId`) REFERENCES `condominios`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `secoes` ADD CONSTRAINT `secoes_revistaId_revistas_id_fk` FOREIGN KEY (`revistaId`) REFERENCES `revistas`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `telefones_uteis` ADD CONSTRAINT `telefones_uteis_revistaId_revistas_id_fk` FOREIGN KEY (`revistaId`) REFERENCES `revistas`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `vagas_estacionamento` ADD CONSTRAINT `vagas_estacionamento_condominioId_condominios_id_fk` FOREIGN KEY (`condominioId`) REFERENCES `condominios`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `votacoes` ADD CONSTRAINT `votacoes_revistaId_revistas_id_fk` FOREIGN KEY (`revistaId`) REFERENCES `revistas`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `votos` ADD CONSTRAINT `votos_votacaoId_votacoes_id_fk` FOREIGN KEY (`votacaoId`) REFERENCES `votacoes`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `votos` ADD CONSTRAINT `votos_opcaoId_opcoes_votacao_id_fk` FOREIGN KEY (`opcaoId`) REFERENCES `opcoes_votacao`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `votos` ADD CONSTRAINT `votos_usuarioId_users_id_fk` FOREIGN KEY (`usuarioId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;