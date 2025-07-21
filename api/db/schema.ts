import { pgTable, text, integer, varchar, primaryKey, timestamp, serial, date } from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: text('user_id').primaryKey(),
});

export const userMovieTable = pgTable("user_movie", {
    userId: text("user_id").notNull().references(() => usersTable.id),
    movieId: integer("movie_id").notNull(), // external movie ID
    rating: integer("rating"),
    watchedAt: date("watched_at"),
}, (table) => ({
    pk: primaryKey({ columns: [table.userId, table.movieId] }),
}));

export const movieCommentsTable = pgTable("movie_comments", {
    id: serial("id").primaryKey(),
    userId: text("user_id").notNull().references(() => usersTable.id),
    movieId: integer("movie_id").notNull(), // external movie ID
    comment: varchar("comment", { length: 1000 }).notNull(),
    commentedAt: timestamp("commented_at", { withTimezone: true }).defaultNow(),
});