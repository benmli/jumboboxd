import { db, userMovieTable, movieCommentsTable } from './db/index.js';
import { eq, and } from 'drizzle-orm';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const movieId = url.searchParams.get('id');
  const userId = url.searchParams.get('userId');
  if (!movieId) {
    return new Response(JSON.stringify({ error: 'Missing movie id' }), { status: 400 });
  }

  // calculate average rating
  const ratings = await db.select({ rating: userMovieTable.rating })
    .from(userMovieTable)
    .where(eq(userMovieTable.movieId, Number(movieId)));
  const avgRating = ratings.length
    ? ratings.reduce((sum, r) => sum + (r.rating ?? 0), 0) / ratings.length
    : null;

  // fetch all comments
  const comments = await db.select()
    .from(movieCommentsTable)
    .where(eq(movieCommentsTable.movieId, Number(movieId)));

  // fetch current user's rating/watchedAt if userId present
  let userRating = null;
  let userWatchedAt = null;
  if (userId) {
    const [userMovie] = await db.select()
      .from(userMovieTable)
      .where(and(eq(userMovieTable.userId, userId), eq(userMovieTable.movieId, Number(movieId))));
    if (userMovie) {
      userRating = userMovie.rating ?? null;
      userWatchedAt = userMovie.watchedAt ?? null;
    }
  }

  return new Response(JSON.stringify({
    averageRating: avgRating,
    comments,
    userRating,
    userWatchedAt,
  }), { headers: { 'Content-Type': 'application/json' } });
}

// add comment or rating
export async function POST(request: Request) {
  const body = await request.json();
  const { userId, movieId, comment, rating, watchedAt } = body;

  // Require at least one of rating or watchedAt (comment is optional)
  if (!userId || !movieId || (rating == null && !watchedAt)) {
    return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
  }

  // insert comment if present
  if (comment) {
    await db.insert(movieCommentsTable).values({
      userId,
      movieId: Number(movieId),
      comment,
    });
  }

  // insert or update rating/watchedAt if present
  if (rating != null || watchedAt) {
    // delete old, insert new
    await db.delete(userMovieTable)
      .where(and(eq(userMovieTable.userId, userId), eq(userMovieTable.movieId, Number(movieId))));
    await db.insert(userMovieTable).values({
      userId,
      movieId: Number(movieId),
      rating: rating != null ? Number(rating) : undefined,
      watchedAt: watchedAt || undefined,
    });
  }

  return new Response(JSON.stringify({ success: true }), { headers: { 'Content-Type': 'application/json' } });
}