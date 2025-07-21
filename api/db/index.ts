import 'dotenv/config';
import { drizzle } from 'drizzle-orm/neon-http';
import { usersTable, userMovieTable, movieCommentsTable } from './schema.js';

// check for DATABASE_URL
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL must be a Neon postgres connection string');
}

// create the database connection
const db = drizzle(process.env.DATABASE_URL, {
  schema: { usersTable, userMovieTable, movieCommentsTable },
});

// export for use in API routes
export { db, usersTable, userMovieTable, movieCommentsTable };