import { db, userMovieTable, movieCommentsTable } from './db/index.js';
import { eq, and } from 'drizzle-orm';
import jwt, { JwtPayload } from 'jsonwebtoken'

const permittedOrigins = process.env.PERMITTED_ORIGINS;

function verifyToken(request: Request): string | undefined {
  const tokenHeader = request.headers.get('Authorization');
  if (!tokenHeader) {
    console.log("No authorization token header")
    return undefined;
  }
  const token = tokenHeader.replace(/^Bearer\s+/i, '');

  const publicKey = process.env.CLERK_JWT_KEY?.replace(/\\n/g, '\n');

  if (!publicKey) {
    console.log("No public key")
    return undefined;
  }
  
  try {
    const decoded = jwt.verify(token, publicKey, { algorithms: ['RS256'] }) as JwtPayload;

    if (!decoded.exp) {
      throw new Error("Missing exp in token.");
    }

    if (!decoded.nbf) {
      throw new Error("Missing nbf in token.");
    }

    // validate the token's expiration (exp) and not before (nbf) claims
    const currentTime = Math.floor(Date.now() / 1000)
    if (decoded.exp < currentTime || decoded.nbf > currentTime) {
      throw new Error('Token is expired or not yet valid')
    }

    // validate the token's authorized party (azp) claim
    if (decoded.azp && permittedOrigins && !permittedOrigins.includes(decoded.azp)) {
      throw new Error("Invalid 'azp' claim")
    }

    return decoded.sub; // Clerk userId
  } catch (error) {
    console.log("Error in GET request:", error)
    return undefined; // unauthenticated
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const movieId = url.searchParams.get('id');
  if (!movieId) {
    return new Response(JSON.stringify({ error: 'Missing movie id' }), { status: 400 });
  }

  const userId = verifyToken(request);

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

  let userRating: number | null = null;
  let userWatchedAt: string | null = null;

  // fetch current user's rating/watchedAt if user is signed in
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
  const userId = verifyToken(request);
  if (!userId) {
    return new Response(JSON.stringify({ error: 'Not authenticated' }), { status: 401 });
  }

  const body = await request.json();
  const { movieId, comment, rating, watchedAt } = body;

  // Require at least one of rating or watchedAt (comment is optional)
  if (!movieId || (rating == null && !watchedAt)) {
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