CREATE TABLE `anunciantes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`condominioId` int NOT NULL,
	`nome` varchar(255) NOT NULL,
	`descricao` text,
	`categoria` enum('comercio','servicos','profissionais','alimentacao','saude','educacao','outros') NOT NULL DEFAULT 'outros',
	`logoUrl` text,
	`telefone` varchar(20),
	`whatsapp` varchar(20),
	`email` varchar(320),
	`website` text,
	`endereco` text,
	`instagram` varchar(100),
	`facebook` varchar(100),
	`horarioFuncionamento` text,
	`statusAnunciante` enum('ativo','inativo') NOT NULL DEFAULT 'ativo',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `anunciantes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `anuncios` (
	`id` int AUTO_INCREMENT NOT NULL,
	`anuncianteId` int NOT NULL,
	`revistaId` int,
	`titulo` varchar(255) NOT NULL,
	`descricao` text,
	`bannerUrl` text,
	`linkDestino` text,
	`posicao` enum('capa','contracapa','pagina_interna','rodape','lateral') NOT NULL DEFAULT 'pagina_interna',
	`tamanho` enum('pequeno','medio','grande','pagina_inteira') NOT NULL DEFAULT 'medio',
	`dataInicio` timestamp,
	`dataFim` timestamp,
	`statusAnuncio` enum('ativo','pausado','expirado','pendente') NOT NULL DEFAULT 'pendente',
	`visualizacoes` int DEFAULT 0,
	`cliques` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `anuncios_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `anunciantes` ADD CONSTRAINT `anunciantes_condominioId_condominios_id_fk` FOREIGN KEY (`condominioId`) REFERENCES `condominios`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `anuncios` ADD CONSTRAINT `anuncios_anuncianteId_anunciantes_id_fk` FOREIGN KEY (`anuncianteId`) REFERENCES `anunciantes`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `anuncios` ADD CONSTRAINT `anuncios_revistaId_revistas_id_fk` FOREIGN KEY (`revistaId`) REFERENCES `revistas`(`id`) ON DELETE no action ON UPDATE no action;