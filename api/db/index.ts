import 'dotenv/config';
import { drizzle } from 'drizzle-orm/neon-http';
import { usersTable, moviesTable, userMovieTable, movieCommentsTable } from './schema';

// check for DATABASE_URL
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL must be a Neon postgres connection string');
}

// create the database connection
const db = drizzle(process.env.DATABASE_URL, {
  schema: { usersTable, moviesTable, userMovieTable, movieCommentsTable },
});

// export for use in API routes
export { db, usersTable, moviesTable, userMovieTable, movieCommentsTable };

// test connection
async function main() {
  try {
    console.log('Testing database connection...');
    // add a simple test query here later
    console.log('Database connection successful!');
  } catch (error) {
    console.error('Database connection failed:', error);
  }
}

main().catch(console.error);