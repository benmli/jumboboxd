import { useEffect, useState } from "react";
import { useParams } from "wouter";
import { useUser } from '@clerk/clerk-react';
import { Rating } from 'react-simple-star-rating';

interface Comment {
  id: number;
  userId: string;
  comment: string;
  commentedAt: string;
}
interface Movie {
  title: string;
  description: string;
  id: number;
  year: number;
  poster: string;
  averageRating?: number;
  comments?: Comment[];
}

export default function MovieDetails() {
  const params = useParams();
  const { user } = useUser();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userRating, setUserRating] = useState<number | null>(null);
  const [userWatchedAt, setUserWatchedAt] = useState<string | null>(null);
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState<number | ''>('');
  const [watchedAt, setWatchedAt] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchMovie = async () => {
    setLoading(true);
    try {
      // fetch movie details from external API
      const detailsRes = await fetch(`/api/movie?id=${params?.id}`);
      if (!detailsRes.ok) throw new Error('Failed to fetch movie details');
      const details = await detailsRes.json();

      // fetch comments/ratings from internal API
      const metaRes = await fetch(`/api/movie-meta?id=${params?.id}${user ? `&userId=${user.id}` : ''}`);
      if (!metaRes.ok) throw new Error('Failed to fetch movie metadata')
      const meta = await metaRes.json();

      setMovie({
        ...details,
        averageRating: meta.averageRating,
        comments: meta.comments,
      });
      setUserRating(meta.userRating ?? null);
      setUserWatchedAt(meta.userWatchedAt ?? null);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (params?.id && user !== undefined) {
      fetchMovie();
    }
    // eslint-disable-next-line
  }, [params?.id, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/movie-meta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          movieId: params?.id,
          comment: comment.trim() || undefined,
          rating: rating === '' ? undefined : Number(rating),
          watchedAt: watchedAt || undefined,
        }),
      });
      if (!res.ok) throw new Error('Failed to submit');
      setComment('');
      setRating('');
      setWatchedAt('');
      await fetchMovie();
    } catch (err) {
      alert('Error submitting: ' + (err instanceof Error ? err.message : err));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-4">Loading movie details...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">Error: {error}</div>;
  }

  if (!movie) {
    return <div className="p-4">Movie not found</div>;
  }

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="md:flex">
          <div className="md:w-1/3">
            <img 
              src={movie.poster} 
              alt={movie.title}
              className="max-h-[600px] w-auto object-contain"
            />
          </div>
          <div className="p-6 md:w-2/3">
            <h1 className="text-3xl font-bold mb-2">{movie.title}</h1>
            <p className="text-gray-600 mb-4">{movie.year}</p>
            <p className="text-gray-700">{movie.description}</p>
            <div className="mt-4 font-semibold flex items-center gap-2">
              <span>Average rating:</span>
              {movie.averageRating ? (
                <span className="flex items-center gap-2">
                  <Rating
                    readonly
                    size={24}
                    initialValue={movie.averageRating}
                    allowFraction
                    SVGstyle={{ display: 'inline-block', verticalAlign: 'text-top' }}
                    iconsCount={10}
                  />
                  {movie.averageRating.toFixed(2)}
                </span>
              ) : (
                <p className="text-sm text-gray-400 italic">No ratings yet. Be the first one to rate this movie!</p>
              )}
            </div>
            {user ? (
              <>
                {userRating !== null && (
                  <div className="mb-2 text-blue-700 font-semibold flex items-center gap-2">
                    <span>Your current rating:</span>
                    <span className="flex items-center align-middle">
                      <Rating
                        readonly
                        size={24}
                        initialValue={userRating}
                        allowFraction
                        SVGstyle={{ display: 'inline-block', verticalAlign: 'text-top' }}
                        iconsCount={10}
                      />
                      <span className="ml-2">{userRating}</span>
                    </span>
                  </div>
                )}
                {userWatchedAt && (
                  <p className="mb-2 text-blue-700 font-semibold">
                    Watched on: {userWatchedAt}
                  </p>
                )}
                <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
                  <div>
                    <label className="block font-semibold">Rate this movie (1-10):</label>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={rating}
                      onChange={e => setRating(e.target.value === '' ? '' : Math.max(1, Math.min(10, Number(e.target.value))))}
                      className="border rounded px-2 py-1 w-20"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold">Date watched:</label>
                    <input
                      type="date"
                      value={watchedAt}
                      onChange={e => setWatchedAt(e.target.value)}
                      className="border rounded px-2 py-1"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold">Add a comment (optional):</label>
                    <textarea
                      value={comment}
                      onChange={e => setComment(e.target.value)}
                      className="border rounded px-2 py-1 w-full"
                      rows={2}
                      maxLength={1000}
                    />
                    <div className="text-xs text-gray-500 flex justify-between">
                      {comment.length}/1000
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={submitting || !watchedAt || rating === '' || comment.length > 1000}
                    className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300 hover:bg-blue-600 transition-colors"
                  >
                    {submitting ? 'Submitting...' : 'Submit'}
                  </button>
                </form>
              </>
            ) : (
              <div className="text-red-500">
                <p>Log in to add movies to your library!</p>
              </div>
            )}
          </div>
        </div>
        <div className="p-6">
          <h2 className="text-xl font-bold mb-2">Comments</h2>
          {movie.comments && movie.comments.length > 0 ? (
            <ul>
              {movie.comments.map((c) => (
                <li key={c.id} className="mb-2 border-b pb-2">
                  <div className="text-xs text-gray-500 mb-1">
                    {c.userId} — {new Date(c.commentedAt).toLocaleDateString()}
                  </div>
                  <div>{c.comment}</div>
                </li>
              ))}
            </ul>
          ) : (
            <p>No comments yet.</p>
          )}
        </div>
      </div>
    </div>
  );
} 