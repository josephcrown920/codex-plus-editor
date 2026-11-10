CREATE TABLE `legacy_workspace_owner` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL
);
--> statement-breakpoint
ALTER TABLE `projects` ADD `workspace_id` text DEFAULT 'legacy' NOT NULL;