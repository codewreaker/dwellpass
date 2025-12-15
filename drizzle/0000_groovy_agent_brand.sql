CREATE TABLE `attendance` (
	`id` text PRIMARY KEY NOT NULL,
	`eventId` text NOT NULL,
	`patronId` text NOT NULL,
	`attended` integer DEFAULT false NOT NULL,
	`checkInTime` integer,
	`checkOutTime` integer,
	FOREIGN KEY (`eventId`) REFERENCES `events`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`patronId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_attendance_eventId` ON `attendance` (`eventId`);--> statement-breakpoint
CREATE INDEX `idx_attendance_patronId` ON `attendance` (`patronId`);--> statement-breakpoint
CREATE INDEX `idx_attendance_attended` ON `attendance` (`attended`);--> statement-breakpoint
CREATE INDEX `idx_attendance_unique` ON `attendance` (`eventId`,`patronId`);--> statement-breakpoint
CREATE TABLE `events` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`status` text NOT NULL,
	`startTime` integer NOT NULL,
	`endTime` integer NOT NULL,
	`location` text NOT NULL,
	`capacity` integer,
	`hostId` text NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	FOREIGN KEY (`hostId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_events_status` ON `events` (`status`);--> statement-breakpoint
CREATE INDEX `idx_events_hostId` ON `events` (`hostId`);--> statement-breakpoint
CREATE INDEX `idx_events_startTime` ON `events` (`startTime`);--> statement-breakpoint
CREATE TABLE `loyalty` (
	`id` text PRIMARY KEY NOT NULL,
	`patronId` text NOT NULL,
	`description` text NOT NULL,
	`tier` text,
	`points` integer DEFAULT 0,
	`reward` text,
	`issuedAt` integer NOT NULL,
	`expiresAt` integer,
	FOREIGN KEY (`patronId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_loyalty_patronId` ON `loyalty` (`patronId`);--> statement-breakpoint
CREATE INDEX `idx_loyalty_tier` ON `loyalty` (`tier`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`firstName` text NOT NULL,
	`lastName` text NOT NULL,
	`phone` text,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE INDEX `idx_users_email` ON `users` (`email`);--> statement-breakpoint
CREATE INDEX `idx_users_createdAt` ON `users` (`createdAt`);