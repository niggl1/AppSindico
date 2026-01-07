ALTER TABLE `users` ADD `senha` varchar(255);--> statement-breakpoint
ALTER TABLE `users` ADD `resetToken` varchar(64);--> statement-breakpoint
ALTER TABLE `users` ADD `resetTokenExpira` timestamp;