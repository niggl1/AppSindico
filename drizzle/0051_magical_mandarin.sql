ALTER TABLE `os_chat` MODIFY COLUMN `mensagem` text;--> statement-breakpoint
ALTER TABLE `os_chat` ADD `anexoNome` varchar(255);--> statement-breakpoint
ALTER TABLE `os_chat` ADD `anexoTipo` varchar(100);--> statement-breakpoint
ALTER TABLE `os_chat` ADD `anexoTamanho` int;