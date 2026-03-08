PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_certificates` (
	`domain` text PRIMARY KEY NOT NULL,
	`key` text NOT NULL,
	`cert` text NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_certificates`("domain", "key", "cert") SELECT "domain", "key", "cert" FROM `certificates`;--> statement-breakpoint
DROP TABLE `certificates`;--> statement-breakpoint
ALTER TABLE `__new_certificates` RENAME TO `certificates`;--> statement-breakpoint
PRAGMA foreign_keys=ON;