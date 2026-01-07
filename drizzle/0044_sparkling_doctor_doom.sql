ALTER TABLE `apps` ADD `shareLink` varchar(50);--> statement-breakpoint
ALTER TABLE `apps` ADD CONSTRAINT `apps_shareLink_unique` UNIQUE(`shareLink`);