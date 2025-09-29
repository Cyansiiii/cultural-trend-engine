CREATE TABLE `trend_demographics` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`trend_id` integer,
	`group` text NOT NULL,
	`label` text NOT NULL,
	`value` integer NOT NULL,
	FOREIGN KEY (`trend_id`) REFERENCES `trends`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `trend_demographics_trend_id_idx` ON `trend_demographics` (`trend_id`);--> statement-breakpoint
CREATE TABLE `trend_posts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`trend_id` integer,
	`author` text NOT NULL,
	`content` text NOT NULL,
	`sentiment` text NOT NULL,
	`posted_at` text NOT NULL,
	FOREIGN KEY (`trend_id`) REFERENCES `trends`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `trend_posts_trend_id_idx` ON `trend_posts` (`trend_id`);--> statement-breakpoint
CREATE TABLE `trend_regions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`trend_id` integer,
	`region` text NOT NULL,
	`interest` integer NOT NULL,
	FOREIGN KEY (`trend_id`) REFERENCES `trends`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `trend_regions_trend_id_idx` ON `trend_regions` (`trend_id`);--> statement-breakpoint
CREATE TABLE `trend_tags` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`trend_id` integer,
	`tag` text NOT NULL,
	FOREIGN KEY (`trend_id`) REFERENCES `trends`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `trend_tags_trend_id_idx` ON `trend_tags` (`trend_id`);--> statement-breakpoint
CREATE TABLE `trend_velocity_points` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`trend_id` integer,
	`period_index` integer NOT NULL,
	`value` integer NOT NULL,
	FOREIGN KEY (`trend_id`) REFERENCES `trends`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `trend_velocity_points_trend_id_idx` ON `trend_velocity_points` (`trend_id`);--> statement-breakpoint
CREATE TABLE `trends` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`slug` text NOT NULL,
	`title` text NOT NULL,
	`volume` integer NOT NULL,
	`velocity` integer NOT NULL,
	`sentiment` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `trends_slug_unique` ON `trends` (`slug`);--> statement-breakpoint
CREATE INDEX `trends_slug_idx` ON `trends` (`slug`);