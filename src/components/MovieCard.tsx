import { Link } from "wouter";

interface MovieCardProps {
  title: string;
  id: number;
  year: number;
  poster: string;
}

export default function MovieCard({ title, year, poster, id }: MovieCardProps) {
  return (
    <Link href={`/movie/${id}`}>
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer h-full">
        <div className="relative">
          <img 
            src={poster} 
            alt={title}
            className="w-full h-[400px] object-cover"
          />
        </div>
        <div className="p-4">
          <h2 className="text-xl font-bold mb-2 line-clamp-2">{title}</h2>
          <p className="text-gray-600">{year}</p>
        </div>
      </div>
    </Link>
  );
}