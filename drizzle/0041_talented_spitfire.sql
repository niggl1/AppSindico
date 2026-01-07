CREATE TABLE `funcionario_acessos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`funcionarioId` int NOT NULL,
	`condominioId` int NOT NULL,
	`dataHora` timestamp NOT NULL DEFAULT (now()),
	`ip` varchar(45),
	`userAgent` text,
	`dispositivo` varchar(100),
	`navegador` varchar(100),
	`sistemaOperacional` varchar(100),
	`localizacao` varchar(255),
	`tipoAcesso` enum('login','logout','recuperacao_senha','alteracao_senha') DEFAULT 'login',
	`sucesso` boolean DEFAULT true,
	`motivoFalha` text,
	CONSTRAINT `funcionario_acessos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `funcionario_acessos` ADD CONSTRAINT `funcionario_acessos_funcionarioId_funcionarios_id_fk` FOREIGN KEY (`funcionarioId`) REFERENCES `funcionarios`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `funcionario_acessos` ADD CONSTRAINT `funcionario_acessos_condominioId_condominios_id_fk` FOREIGN KEY (`condominioId`) REFERENCES `condominios`(`id`) ON DELETE no action ON UPDATE no action;