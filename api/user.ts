import { db, userMovieTable, movieCommentsTable } from './db/index.js';
import { eq } from 'drizzle-orm';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const userId = url.searchParams.get('id');
  if (!userId) {
    return new Response(JSON.stringify({ error: 'Missing user id' }), { status: 400 });
  }

  // Fetch user's ratings
  const ratings = await db.select()
    .from(userMovieTable)
    .where(eq(userMovieTable.userId, userId));

  // Fetch user's comments
  const comments = await db.select()
    .from(movieCommentsTable)
    .where(eq(movieCommentsTable.userId, userId));

  return new Response(JSON.stringify({
    ratings,
    comments,
  }), { headers: { 'Content-Type': 'application/json' } });
}