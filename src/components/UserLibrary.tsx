import { useUser } from '@clerk/clerk-react';
import { useEffect, useState } from 'react';
import { Link } from 'wouter';

interface UserMovie {
  movieId: number;
  rating?: number;
  watchedAt?: string;
}

interface MovieDetails {
  id: number;
  title: string;
  year: number;
  poster: string;
}

interface UserComment {
  movieId: number;
  comment: string;
  commentedAt: string;
}

export default function UserLibrary() {
  const { user } = useUser();
  const [userMovies, setUserMovies] = useState<UserMovie[]>([]);
  const [movieDetails, setMovieDetails] = useState<Record<number, MovieDetails>>({});
  const [userComments, setUserComments] = useState<Record<number, UserComment[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const fetchUserData = async () => {
      try {
        const res = await fetch(`/api/user?id=${user.id}`);
        if (!res.ok) throw new Error('Failed to fetch user data');
        const json = await res.json();
        setUserMovies(json.ratings);
        // group comments by movieId
        const commentsByMovie: Record<number, UserComment[]> = {};
        for (const c of json.comments) {
          if (!commentsByMovie[c.movieId]) commentsByMovie[c.movieId] = [];
          commentsByMovie[c.movieId].push(c);
        }
        setUserComments(commentsByMovie);
        setError(null);

        // fetch movie details for each movieId
        const details: Record<number, MovieDetails> = {};
        await Promise.all(json.ratings.map(async (r: UserMovie) => {
          const movieRes = await fetch(`/api/movie?id=${r.movieId}`);
          if (movieRes.ok) {
            const movie = await movieRes.json();
            details[r.movieId] = movie;
          }
        }));
        setMovieDetails(details);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, [user]);

  if (!user) return <p className="p-4">Please log in to see your library.</p>;
  if (loading) return <p className="p-4">Loading your library...</p>;
  if (error) return <p className="p-4 text-red-500">Error: {error}</p>;
  if (!userMovies.length) return <p className="p-4">No watched or rated movies yet.</p>;

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">My Library</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {userMovies.map((curMovie, index) => {
          const movie = movieDetails[curMovie.movieId];
          const comments = userComments[curMovie.movieId] || [];
          return (
            <Link href={`/movie/${movie?.id ?? curMovie.movieId}`} key={index} className="block hover:shadow-lg transition-shadow">
                <div key={index} className="flex bg-white rounded-lg shadow p-4">
                    {movie && (
                        <img src={movie.poster} alt={movie.title} className="w-24 h-36 object-cover rounded mr-4" />
                    )}
                    <div>
                    <h2 className="text-lg font-bold">{movie ? movie.title : `Movie #${curMovie.movieId}`}</h2>
                    {movie && <p className="text-gray-600">{movie.year}</p>}
                    {curMovie.rating && (
                    <p className="mt-2">Your rating: <span className="font-bold">{curMovie.rating}</span></p>
                    )}
                    {curMovie.watchedAt && (
                    <p>Watched on: <span className="font-mono">{curMovie.watchedAt}</span></p>
                    )}
                    {comments.length > 0 && (
                      <div className="mt-2">
                        <p className="font-semibold">My Comments:</p>
                        <ul className="list-disc ml-4">
                          {comments.map((c, i) => (
                            <li key={i} className="italic text-gray-700">
                              "{c.comment}" <span className="text-xs text-gray-500">({new Date(c.commentedAt).toLocaleDateString()})</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                </div>
                </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}