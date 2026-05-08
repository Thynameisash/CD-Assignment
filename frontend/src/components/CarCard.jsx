import { Link } from 'react-router-dom';
import { useShortlist } from '../hooks/useShortlist';

export default function CarCard({ car, showScore, score, graceWindow, overBudgetBy, matchReasons }) {
  const { has, toggle } = useShortlist();
  const saved = has(car.id);

  return (
    <div className="group flex flex-col overflow-hidden rounded-lg border border-border bg-white shadow-sm transition-shadow hover:shadow-md">
      {/* Image */}
      <div className="relative aspect-[16/10] overflow-hidden bg-gray-100">
        <img
          src={car.imageUrl}
          alt={`${car.make} ${car.model}`}
          className="h-full w-full object-cover"
          loading="lazy"
        />
        {graceWindow && (
          <span className="absolute top-2 left-2 rounded bg-gray-700 px-2 py-0.5 text-xs font-medium text-white">
            Stretch Pick +${overBudgetBy?.toLocaleString()}
          </span>
        )}
        {showScore && score != null && (
          <span className="absolute top-2 right-2 rounded bg-primary-600 px-2 py-0.5 text-xs font-bold text-white">
            {score}% Match
          </span>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-4">
        <div className="mb-1 flex items-start justify-between">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">
              {car.make} {car.model}
            </h3>
            <p className="text-xs text-gray-500">{car.variant} · {car.year}</p>
          </div>
          <p className="text-sm font-semibold text-gray-900">
            ${car.price?.toLocaleString()}
          </p>
        </div>

        <div className="mt-1 flex flex-wrap gap-1.5 text-[11px] text-gray-500">
          <span className="rounded bg-surface-alt px-1.5 py-0.5">{car.bodyType}</span>
          <span className="rounded bg-surface-alt px-1.5 py-0.5">{car.fuelType}</span>
          <span className="rounded bg-surface-alt px-1.5 py-0.5">{car.mileage} km/l</span>
          <span className="rounded bg-surface-alt px-1.5 py-0.5">★ {car.safetyRating}</span>
        </div>

        {/* Match Reasons */}
        {matchReasons?.length > 0 && (
          <ul className="mt-2 space-y-0.5">
            {matchReasons.map((reason, i) => (
              <li key={i} className="text-xs text-gray-600">
                <span className="text-primary-500 mr-1">✓</span>
                {reason}
              </li>
            ))}
          </ul>
        )}

        {/* Actions */}
        <div className="mt-auto flex items-center gap-2 pt-3">
          <Link
            to={`/cars/${car.id}`}
            className="flex-1 rounded border border-border py-1.5 text-center text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            Details
          </Link>
          <button
            onClick={() => toggle(car.id)}
            className={`flex-1 rounded py-1.5 text-center text-xs font-medium transition-colors ${
              saved
                ? 'bg-gray-200 text-gray-700'
                : 'bg-primary-600 text-white hover:bg-primary-700'
            }`}
          >
            {saved ? '✓ Saved' : '+ Shortlist'}
          </button>
        </div>
      </div>
    </div>
  );
}
