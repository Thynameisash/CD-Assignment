import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import CarCard from '../components/CarCard';
import Spinner from '../components/Spinner';

export default function Home() {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getCars({ limit: 4, sortBy: 'user_rating', sortOrder: 'desc' })
      .then((res) => setCars(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4">
      {/* Hero */}
      <section className="py-16 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          Not sure which car to buy?
        </h1>
        <p className="mx-auto mt-3 max-w-lg text-gray-500">
          Take our 60-second quiz and get personalized recommendations backed by
          real data — no guesswork.
        </p>
        <div className="mt-8 flex items-center justify-center gap-4">
          <Link
            to="/quiz"
            className="rounded-lg bg-primary-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-700"
          >
            Start Quiz →
          </Link>
          <Link
            to="/browse"
            className="text-sm font-medium text-gray-600 underline-offset-4 hover:underline"
          >
            Or browse all cars →
          </Link>
        </div>
      </section>

      {/* Popular Picks */}
      <section className="pb-16">
        <h2 className="mb-6 text-lg font-semibold text-gray-900">Popular Picks</h2>
        {loading ? (
          <Spinner />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {cars.map((car) => (
              <CarCard key={car.id} car={car} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
