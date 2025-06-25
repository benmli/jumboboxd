import { useEffect, useState } from "react";
import MovieCard from "./MovieCard";
import { useParams, useLocation } from "wouter";

interface Movie {
  title: string;
  description: string;
  id: number;
  year: number;
  poster: string;
}

export default function MovieList() {
    const params = useParams();
    const [, navigate] = useLocation();
    const listId = params?.id || "1";
    const [movies, setMovies] = useState<Movie[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    console.log('MovieList rendered with listId:', listId);

    useEffect(() => {
        const fetchMovies = async () => {
            console.log('Fetching movies for listId:', listId);
            try {
                const url = `/api/list?page=${listId}`;
                console.log('Fetching from URL:', url);
                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error('Failed to fetch movies');
                }

                const data = await response.json();
                console.log('Received data:', data);
                setMovies(data);
                setError(null);
            } catch (err) {
                console.error('Error fetching movies:', err);
                setError(err instanceof Error ? err.message : 'An error occurred');
            } finally {
                setLoading(false);
            }
        };

        fetchMovies();
    }, [listId]);

    if (loading) {
        return <div className="p-4">Loading movies...</div>;
    }

    if (error) {
        return <div className="p-4 text-red-500">Error: {error}</div>;
    }

    return (
        <div className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {movies.map((movie) => (
                    <MovieCard
                        key={movie.id}
                        title={movie.title}
                        id={movie.id}
                        year={movie.year}
                        poster={movie.poster}
                    />
                ))}
            </div>
            <div className="mt-8 flex justify-center gap-4">
                <button
                    onClick={() => navigate(`/list/${Number(listId) - 1}`)}
                    disabled={listId === "1"}
                    className="px-6 py-2 bg-blue-500 text-white rounded-lg disabled:bg-gray-300 hover:bg-blue-600 transition-colors"
                >
                    Previous
                </button>
                <button
                    onClick={() => navigate(`/list/${Number(listId) + 1}`)}
                    disabled={listId === "10"}
                    className="px-6 py-2 bg-blue-500 text-white rounded-lg disabled:bg-gray-300 hover:bg-blue-600 transition-colors"
                >
                    Next
                </button>
            </div>
        </div>
    );
}