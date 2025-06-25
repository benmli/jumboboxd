import { useEffect, useState } from "react";
import { useParams } from "wouter";

interface Movie {
  title: string;
  description: string;
  id: number;
  year: number;
  poster: string;
}

export default function MovieDetails() {
  const params = useParams();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        const response = await fetch(`https://jumboboxd.soylemez.net/api/movie?id=${params?.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch movie details');
        }
        const data = await response.json();
        setMovie(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (params?.id) {
      fetchMovie();
    }
  }, [params?.id]);

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
              className="w-full h-full object-cover"
            />
          </div>
          <div className="p-6 md:w-2/3">
            <h1 className="text-3xl font-bold mb-2">{movie.title}</h1>
            <p className="text-gray-600 mb-4">{movie.year}</p>
            <p className="text-gray-700">{movie.description}</p>
          </div>
        </div>
      </div>
    </div>
  );
} 