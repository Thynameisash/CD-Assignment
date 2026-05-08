import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, Legend,
} from 'recharts';
import { api } from '../lib/api';
import Spinner from '../components/Spinner';

const COLORS = ['#3b82f6', '#64748b', '#0ea5e9'];

const COMPARE_ROWS = [
  { label: 'Price', key: 'price', format: (v) => `$${v?.toLocaleString()}`, best: 'min' },
  { label: 'Body Type', key: 'bodyType', format: (v) => v, best: null },
  { label: 'Fuel Type', key: 'fuelType', format: (v) => v, best: null },
  { label: 'Transmission', key: 'transmission', format: (v) => v, best: null },
  { label: 'Mileage', key: 'mileage', format: (v) => `${v} km/l`, best: 'max' },
  { label: 'Horsepower', key: 'horsepower', format: (v) => `${v} hp`, best: 'max' },
  { label: 'Seats', key: 'seatingCapacity', format: (v) => v, best: null },
  { label: 'Safety ★', key: 'safetyRating', format: (v) => v, best: 'max' },
  { label: 'User Rating ★', key: 'userRating', format: (v) => v, best: 'max' },
];

export default function Compare() {
  const [searchParams] = useSearchParams();
  const idsParam = searchParams.get('ids') || '';
  const ids = idsParam.split(',').filter(Boolean);

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (ids.length < 2) {
      setLoading(false);
      return;
    }
    setLoading(true);
    api
      .compareCars(ids)
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [idsParam]);

  if (loading) return <Spinner />;
  if (ids.length < 2)
    return (
      <p className="py-20 text-center text-sm text-gray-500">
        Select 2–3 cars to compare. Go to <Link to="/browse" className="text-primary-600 underline">Browse</Link> or <Link to="/shortlist" className="text-primary-600 underline">Shortlist</Link> to pick cars.
      </p>
    );
  if (error) return <p className="py-20 text-center text-sm text-gray-500">{error}</p>;
  if (!data) return null;

  const { data: cars, highlights, radarData } = data;

  const getBestId = (key, dir) => {
    if (!dir) return null;
    return cars.reduce((a, b) =>
      dir === 'max' ? (a[key] > b[key] ? a : b) : (a[key] < b[key] ? a : b)
    ).id;
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-6 text-xl font-bold text-gray-900">Compare Cars ({cars.length})</h1>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-surface-alt">
              <th className="p-3 text-left text-xs font-medium text-gray-500 w-36">Attribute</th>
              {cars.map((car, i) => (
                <th key={car.id} className="p-3 text-center">
                  <Link to={`/cars/${car.id}`} className="text-sm font-semibold text-gray-900 hover:text-primary-600">
                    {car.make} {car.model}
                  </Link>
                  <p className="text-xs text-gray-500">{car.variant}</p>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {COMPARE_ROWS.map((row) => {
              const bestId = getBestId(row.key, row.best);
              return (
                <tr key={row.key} className="border-b border-border last:border-0">
                  <td className="p-3 text-xs font-medium text-gray-500">{row.label}</td>
                  {cars.map((car) => {
                    const isBest = bestId === car.id;
                    return (
                      <td
                        key={car.id}
                        className={`p-3 text-center text-sm ${
                          isBest ? 'font-semibold text-primary-700' : 'text-gray-700'
                        }`}
                      >
                        {isBest && <span className="mr-1 text-primary-500">★</span>}
                        {row.format(car[row.key])}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="border-t border-border bg-surface-alt">
              <td className="p-3" />
              {cars.map((car) => (
                <td key={car.id} className="p-3 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Link
                      to={`/cars/${car.id}`}
                      className="rounded border border-border px-3 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50"
                    >
                      Details
                    </Link>
                  </div>
                </td>
              ))}
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Radar Chart */}
      {radarData?.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-4 text-sm font-semibold text-gray-900">Performance Radar</h2>
          <div className="rounded-lg border border-border bg-white p-4">
            <ResponsiveContainer width="100%" height={350}>
              <RadarChart data={radarData} outerRadius="75%">
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 12, fill: '#64748b' }} />
                <PolarRadiusAxis domain={[0, 1]} tick={false} axisLine={false} />
                {cars.map((car, i) => (
                  <Radar
                    key={car.id}
                    name={`${car.make} ${car.model}`}
                    dataKey={car.id}
                    stroke={COLORS[i]}
                    fill={COLORS[i]}
                    fillOpacity={0.1}
                    strokeWidth={2}
                  />
                ))}
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}
    </div>
  );
}
