import { pgTable, text, integer, varchar, primaryKey, timestamp, serial } from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: text('user_id').primaryKey(),
});

export const moviesTable = pgTable("movies", {
    id: integer("movie_id").primaryKey(),
    title: varchar("title", { length: 255 }).notNull(),
    year: integer("year").notNull(),
    poster: text("poster").notNull(),
});

export const userMovieTable = pgTable("user_movie", {
    userId: text("user_id").notNull().references(() => usersTable.id),
    movieId: integer("movie_id").notNull().references(() => moviesTable.id),
    rating: integer("rating"),
    watchedAt: timestamp("watched_at", { withTimezone: true }).defaultNow(),
}, (table) => ({
    pk: primaryKey({ columns: [table.userId, table.movieId] }),
}));
  
export const movieCommentsTable = pgTable("movie_comments", {
    id: serial("id").primaryKey(),
    userId: text("user_id").notNull().references(() => usersTable.id),
    movieId: integer("movie_id").notNull().references(() => moviesTable.id),
    comment: varchar("comment", { length: 1000 }).notNull(),
    commentedAt: timestamp("commented_at", { withTimezone: true }).defaultNow(),
});