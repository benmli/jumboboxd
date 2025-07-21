import { useUser } from '@clerk/clerk-react';
import { useEffect, useState } from 'react';

interface UserRating {
  movieId: number;
  rating: number;
  watchedAt?: string;
}
interface UserComment {
  id: number;
  movieId: number;
  comment: string;
  commentedAt: string;
}

export default function UserPage() {
  const { user } = useUser();
  const [data, setData] = useState<{ ratings: UserRating[]; comments: UserComment[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const fetchUserData = async () => {
      try {
        const res = await fetch(`/api/user?id=${user.id}`);
        if (!res.ok) throw new Error('Failed to fetch user data');
        const json = await res.json();
        setData(json);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, [user]);

  if (!user) return <p className="p-4">Please log in to see your page.</p>;
  if (loading) return <p className="p-4">Loading your data...</p>;
  if (error) return <p className="p-4 text-red-500">Error: {error}</p>;
  if (!data) return <p className="p-4">No data found.</p>;

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Your Ratings</h1>
      {data.ratings.length > 0 ? (
        <ul className="mb-8">
          {data.ratings.map((r, i) => (
            <li key={i} className="mb-2">
              Movie ID: <span className="font-mono">{r.movieId}</span> — Rating: <span className="font-bold">{r.rating}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p>No ratings yet.</p>
      )}
      <h1 className="text-2xl font-bold mb-4">Your Comments</h1>
      {data.comments.length > 0 ? (
        <ul>
          {data.comments.map((c, i) => (
            <li key={i} className="mb-2">
              Movie ID: <span className="font-mono">{c.movieId}</span> — "{c.comment}"
            </li>
          ))}
        </ul>
      ) : (
        <p>No comments yet.</p>
      )}
    </div>
  );
}
