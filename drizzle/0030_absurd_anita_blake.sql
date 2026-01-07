ALTER TABLE `checklists` ADD `latitude` decimal(10,8);--> statement-breakpoint
ALTER TABLE `checklists` ADD `longitude` decimal(11,8);--> statement-breakpoint
ALTER TABLE `checklists` ADD `enderecoGeo` text;--> statement-breakpoint
ALTER TABLE `manutencoes` ADD `latitude` decimal(10,8);--> statement-breakpoint
ALTER TABLE `manutencoes` ADD `longitude` decimal(11,8);--> statement-breakpoint
ALTER TABLE `manutencoes` ADD `enderecoGeo` text;--> statement-breakpoint
ALTER TABLE `ocorrencias` ADD `latitude` decimal(10,8);--> statement-breakpoint
ALTER TABLE `ocorrencias` ADD `longitude` decimal(11,8);--> statement-breakpoint
ALTER TABLE `ocorrencias` ADD `enderecoGeo` text;--> statement-breakpoint
ALTER TABLE `vistorias` ADD `latitude` decimal(10,8);--> statement-breakpoint
ALTER TABLE `vistorias` ADD `longitude` decimal(11,8);--> statement-breakpoint
ALTER TABLE `vistorias` ADD `enderecoGeo` text;