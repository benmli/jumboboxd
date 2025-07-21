CREATE TABLE "movie_comments" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"movie_id" integer NOT NULL,
	"comment" varchar(1000) NOT NULL,
	"commented_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_movie" (
	"user_id" text NOT NULL,
	"movie_id" integer NOT NULL,
	"rating" integer,
	"watched_at" date,
	CONSTRAINT "user_movie_user_id_movie_id_pk" PRIMARY KEY("user_id","movie_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"user_id" text PRIMARY KEY NOT NULL
);
--> statement-breakpoint
ALTER TABLE "movie_comments" ADD CONSTRAINT "movie_comments_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_movie" ADD CONSTRAINT "user_movie_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE no action ON UPDATE no action;