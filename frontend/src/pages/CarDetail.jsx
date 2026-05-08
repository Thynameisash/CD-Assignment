import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { useShortlist } from '../hooks/useShortlist';
import Spinner from '../components/Spinner';

export default function CarDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { has, toggle } = useShortlist();
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    api
      .getCarById(id)
      .then(setCar)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Spinner />;
  if (error) return <p className="py-20 text-center text-sm text-gray-500">{error}</p>;
  if (!car) return null;

  const saved = has(car.id);

  const specs = [
    { label: 'Body Type', value: car.bodyType },
    { label: 'Fuel Type', value: car.fuelType },
    { label: 'Transmission', value: car.transmission },
    { label: 'Engine', value: car.engineCapacityCC ? `${car.engineCapacityCC} cc` : 'N/A (EV)' },
    { label: 'Horsepower', value: `${car.horsepower} hp` },
    { label: 'Mileage', value: `${car.mileage} km/l` },
    { label: 'Seats', value: car.seatingCapacity },
    { label: 'Year', value: car.year },
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="mb-4 text-sm text-gray-500 hover:text-gray-700"
      >
        ← Back
      </button>

      {/* Header */}
      <div className="flex flex-col gap-6 sm:flex-row">
        <div className="aspect-[16/10] w-full overflow-hidden rounded-lg bg-gray-100 sm:w-80">
          <img
            src={car.imageUrl}
            alt={`${car.make} ${car.model}`}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {car.make} {car.model} {car.variant}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {car.year} · {car.bodyType} · {car.fuelType}
          </p>
          <p className="mt-2 text-2xl font-semibold text-gray-900">
            ${car.price?.toLocaleString()}
          </p>
          <div className="mt-1 flex gap-3 text-sm text-gray-500">
            <span>★ {car.safetyRating} safety</span>
            <span>★ {car.userRating} users ({car.reviewCount} reviews)</span>
          </div>
          <div className="mt-4 flex gap-2">
            <button
              onClick={() => toggle(car.id)}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                saved
                  ? 'bg-gray-200 text-gray-700'
                  : 'bg-primary-600 text-white hover:bg-primary-700'
              }`}
            >
              {saved ? '✓ On Shortlist' : '+ Add to Shortlist'}
            </button>
            <Link
              to={`/compare?ids=${car.id}`}
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Compare
            </Link>
          </div>
        </div>
      </div>

      {/* Specs */}
      <section className="mt-8">
        <h2 className="mb-3 text-sm font-semibold text-gray-900">Specifications</h2>
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-4">
          {specs.map((s) => (
            <div key={s.label} className="bg-white p-3">
              <p className="text-xs text-gray-500">{s.label}</p>
              <p className="text-sm font-medium text-gray-900 capitalize">{s.value}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      {car.features?.length > 0 && (
        <section className="mt-6">
          <h2 className="mb-2 text-sm font-semibold text-gray-900">Features</h2>
          <div className="flex flex-wrap gap-1.5">
            {car.features.map((f) => (
              <span key={f} className="rounded-full bg-surface-alt px-2.5 py-1 text-xs text-gray-600">
                {f}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Pros & Cons */}
      <section className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <h2 className="mb-2 text-sm font-semibold text-gray-900">Pros</h2>
          <ul className="space-y-1">
            {car.pros?.map((p) => (
              <li key={p} className="flex items-start gap-2 text-sm text-gray-600">
                <span className="text-green-500 mt-0.5">✓</span> {p}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="mb-2 text-sm font-semibold text-gray-900">Cons</h2>
          <ul className="space-y-1">
            {car.cons?.map((c) => (
              <li key={c} className="flex items-start gap-2 text-sm text-gray-600">
                <span className="text-gray-400 mt-0.5">✗</span> {c}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Reviews */}
      {car.reviews?.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-3 text-sm font-semibold text-gray-900">
            Reviews ({car.reviews.length})
          </h2>
          <div className="space-y-3">
            {car.reviews.map((r) => (
              <div key={r.id} className="rounded-lg border border-border bg-white p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900">{r.title}</p>
                  <span className="text-xs text-gray-500">★ {r.rating}</span>
                </div>
                <p className="mt-1 text-sm text-gray-600">{r.body}</p>
                <p className="mt-2 text-xs text-gray-400">— {r.author}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
