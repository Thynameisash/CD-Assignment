import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useShortlist } from '../hooks/useShortlist';
import { api } from '../lib/api';
import Spinner from '../components/Spinner';

export default function Shortlist() {
  const { ids, remove, clear } = useShortlist();
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (ids.length === 0) {
      setCars([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    Promise.all(ids.map((id) => api.getCarById(id).catch(() => null)))
      .then((results) => setCars(results.filter(Boolean)))
      .finally(() => setLoading(false));
  }, [ids]);

  const toggleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : prev.length < 3 ? [...prev, id] : prev
    );
  };

  const handleCompare = () => {
    if (selected.length >= 2) {
      navigate(`/compare?ids=${selected.join(',')}`);
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">
          My Shortlist ({cars.length} {cars.length === 1 ? 'car' : 'cars'})
        </h1>
        <div className="flex gap-2">
          {selected.length >= 2 && (
            <button
              onClick={handleCompare}
              className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700"
            >
              Compare Selected ({selected.length})
            </button>
          )}
        </div>
      </div>

      {cars.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-sm text-gray-500">Your shortlist is empty.</p>
          <div className="mt-4 flex justify-center gap-4">
            <Link to="/quiz" className="text-sm font-medium text-primary-600 hover:underline">
              Take the Quiz
            </Link>
            <Link to="/browse" className="text-sm font-medium text-primary-600 hover:underline">
              Browse Cars
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {cars.map((car) => (
            <div
              key={car.id}
              className="flex items-center gap-4 rounded-lg border border-border bg-white p-4"
            >
              <input
                type="checkbox"
                checked={selected.includes(car.id)}
                onChange={() => toggleSelect(car.id)}
                disabled={!selected.includes(car.id) && selected.length >= 3}
                className="h-4 w-4 accent-primary-600"
              />
              <img
                src={car.imageUrl}
                alt={`${car.make} ${car.model}`}
                className="h-14 w-20 rounded object-cover bg-gray-100"
              />
              <div className="flex-1">
                <Link
                  to={`/cars/${car.id}`}
                  className="text-sm font-semibold text-gray-900 hover:text-primary-600"
                >
                  {car.make} {car.model} {car.variant}
                </Link>
                <p className="text-xs text-gray-500">
                  ${car.price?.toLocaleString()} · ★ {car.safetyRating} · {car.fuelType}
                </p>
              </div>
              <button
                onClick={() => remove(car.id)}
                className="text-xs text-gray-400 hover:text-gray-600"
              >
                Remove
              </button>
            </div>
          ))}

          {cars.length >= 2 && (
            <p className="mt-4 text-center text-sm text-gray-500">
              You're confident about your picks!
            </p>
          )}
        </div>
      )}
    </div>
  );
}
