CREATE TABLE `favoritos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`condominioId` int,
	`tipoItem` enum('aviso','comunicado','evento','realizacao','melhoria','aquisicao','votacao','classificado','carona','achado_perdido','funcionario','galeria','card_secao') NOT NULL,
	`itemId` int,
	`cardSecaoId` varchar(50),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `favoritos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `imagens_achados_perdidos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`achadoPerdidoId` int NOT NULL,
	`imagemUrl` text NOT NULL,
	`legenda` varchar(255),
	`ordem` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `imagens_achados_perdidos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `imagens_aquisicoes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`aquisicaoId` int NOT NULL,
	`imagemUrl` text NOT NULL,
	`legenda` varchar(255),
	`ordem` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `imagens_aquisicoes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `imagens_melhorias` (
	`id` int AUTO_INCREMENT NOT NULL,
	`melhoriaId` int NOT NULL,
	`imagemUrl` text NOT NULL,
	`legenda` varchar(255),
	`ordem` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `imagens_melhorias_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `imagens_realizacoes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`realizacaoId` int NOT NULL,
	`imagemUrl` text NOT NULL,
	`legenda` varchar(255),
	`ordem` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `imagens_realizacoes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `imagens_vagas` (
	`id` int AUTO_INCREMENT NOT NULL,
	`vagaId` int NOT NULL,
	`tipo` enum('imagem','anexo') DEFAULT 'imagem',
	`url` text NOT NULL,
	`nome` varchar(255),
	`mimeType` varchar(100),
	`ordem` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `imagens_vagas_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `favoritos` ADD CONSTRAINT `favoritos_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `favoritos` ADD CONSTRAINT `favoritos_condominioId_condominios_id_fk` FOREIGN KEY (`condominioId`) REFERENCES `condominios`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `imagens_achados_perdidos` ADD CONSTRAINT `imagens_achados_perdidos_achadoPerdidoId_achados_perdidos_id_fk` FOREIGN KEY (`achadoPerdidoId`) REFERENCES `achados_perdidos`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `imagens_aquisicoes` ADD CONSTRAINT `imagens_aquisicoes_aquisicaoId_aquisicoes_id_fk` FOREIGN KEY (`aquisicaoId`) REFERENCES `aquisicoes`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `imagens_melhorias` ADD CONSTRAINT `imagens_melhorias_melhoriaId_melhorias_id_fk` FOREIGN KEY (`melhoriaId`) REFERENCES `melhorias`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `imagens_realizacoes` ADD CONSTRAINT `imagens_realizacoes_realizacaoId_realizacoes_id_fk` FOREIGN KEY (`realizacaoId`) REFERENCES `realizacoes`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `imagens_vagas` ADD CONSTRAINT `imagens_vagas_vagaId_vagas_estacionamento_id_fk` FOREIGN KEY (`vagaId`) REFERENCES `vagas_estacionamento`(`id`) ON DELETE no action ON UPDATE no action;