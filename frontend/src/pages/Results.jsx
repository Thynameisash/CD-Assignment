import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import CarCard from '../components/CarCard';
import Spinner from '../components/Spinner';

const LABELS = {
  useCase: { city: 'City', highway: 'Highway', offroad: 'Off-road', family: 'Family' },
  fuelPreference: { petrol: 'Petrol', diesel: 'Diesel', electric: 'Electric', hybrid: 'Hybrid', no_preference: 'Any' },
  topPriority: { safety: 'Safety', mileage: 'Mileage', performance: 'Performance', value: 'Value' },
};
const SEAT_OPTIONS = [2, 4, 5, 7, 8];

export default function Results() {
  const location = useLocation();
  const navigate = useNavigate();
  const initialPrefs = location.state?.prefs;

  const [prefs, setPrefs] = useState(initialPrefs);
  const [draftPrefs, setDraftPrefs] = useState(initialPrefs);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!prefs) {
      navigate('/quiz');
      return;
    }
    setLoading(true);
    api
      .getRecommendations(prefs)
      .then((res) => setResults(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [prefs, navigate]);

  const handleChange = (key, value) => {
    setDraftPrefs((prev) => ({ ...prev, [key]: value }));
  };

  const toggleChip = (key, value) => {
    setDraftPrefs((prev) => {
      const arr = Array.isArray(prev[key]) ? prev[key] : [prev[key]];
      return {
        ...prev,
        [key]: arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value],
      };
    });
  };

  const handleRerun = () => {
    setPrefs({ ...draftPrefs });
  };

  if (!prefs) return null;

  const hasChanges = JSON.stringify(prefs) !== JSON.stringify(draftPrefs);

  return (
    <div className="mx-auto flex max-w-7xl gap-6 px-4 py-8">
      {/* Sidebar */}
      <aside className="hidden w-64 shrink-0 lg:block">
        <div className="sticky top-20 rounded-lg border border-border bg-white p-4">
          <h3 className="mb-4 text-sm font-semibold text-gray-900">Adjust Preferences</h3>

          <div className="space-y-3 text-sm">
            {/* Budget */}
            <label className="block">
              <span className="text-xs text-gray-500">Budget</span>
              <input
                type="number"
                value={draftPrefs.budget}
                onChange={(e) => handleChange('budget', Number(e.target.value))}
                className="mt-1 w-full rounded border border-border px-2 py-1.5 text-sm outline-none focus:border-primary-400"
              />
            </label>

            {/* Budget mode */}
            <label className="block">
              <span className="text-xs text-gray-500">Mode</span>
              <select
                value={draftPrefs.budgetMode}
                onChange={(e) => handleChange('budgetMode', e.target.value)}
                className="mt-1 w-full rounded border border-border px-2 py-1.5 text-sm outline-none focus:border-primary-400"
              >
                <option value="flexible">Flexible (±$3K)</option>
                <option value="strict">Strict</option>
              </select>
            </label>

            {/* Use case - multi-select chips */}
            <div>
              <span className="text-xs text-gray-500">Use Case</span>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {Object.entries(LABELS.useCase).map(([k, v]) => {
                  const selected = (draftPrefs.useCase || []).includes(k);
                  return (
                    <button
                      key={k}
                      onClick={() => toggleChip('useCase', k)}
                      className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                        selected
                          ? 'bg-primary-100 text-primary-700 border border-primary-300'
                          : 'bg-gray-100 text-gray-600 border border-transparent hover:bg-gray-200'
                      }`}
                    >
                      {v}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Fuel - multi-select chips */}
            <div>
              <span className="text-xs text-gray-500">Fuel</span>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {Object.entries(LABELS.fuelPreference).map(([k, v]) => {
                  const selected = (draftPrefs.fuelPreference || []).includes(k);
                  return (
                    <button
                      key={k}
                      onClick={() => toggleChip('fuelPreference', k)}
                      className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                        selected
                          ? 'bg-primary-100 text-primary-700 border border-primary-300'
                          : 'bg-gray-100 text-gray-600 border border-transparent hover:bg-gray-200'
                      }`}
                    >
                      {v}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Seating - multi-select chips */}
            <div>
              <span className="text-xs text-gray-500">Seats</span>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {SEAT_OPTIONS.map((n) => {
                  const selected = (draftPrefs.seatingNeed || []).includes(n);
                  return (
                    <button
                      key={n}
                      onClick={() => toggleChip('seatingNeed', n)}
                      className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                        selected
                          ? 'bg-primary-100 text-primary-700 border border-primary-300'
                          : 'bg-gray-100 text-gray-600 border border-transparent hover:bg-gray-200'
                      }`}
                    >
                      {n}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Priority - multi-select chips */}
            <div>
              <span className="text-xs text-gray-500">Priority</span>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {Object.entries(LABELS.topPriority).map(([k, v]) => {
                  const selected = (draftPrefs.topPriority || []).includes(k);
                  return (
                    <button
                      key={k}
                      onClick={() => toggleChip('topPriority', k)}
                      className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                        selected
                          ? 'bg-primary-100 text-primary-700 border border-primary-300'
                          : 'bg-gray-100 text-gray-600 border border-transparent hover:bg-gray-200'
                      }`}
                    >
                      {v}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              onClick={handleRerun}
              disabled={!hasChanges}
              className="w-full rounded-lg bg-primary-600 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-700 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Re-run ↻
            </button>
          </div>
        </div>
      </aside>

      {/* Results */}
      <main className="flex-1">
        <h1 className="mb-6 text-xl font-bold text-gray-900">Your Top Matches</h1>

        {loading ? (
          <Spinner />
        ) : results.length === 0 ? (
          <p className="text-sm text-gray-500">
            No cars match your criteria. Try adjusting your preferences.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {results.map((r, i) => (
              <div key={r.car.id} className="relative">
                <span className="absolute -left-2 -top-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-gray-800 text-[10px] font-bold text-white">
                  #{i + 1}
                </span>
                <CarCard
                  car={r.car}
                  showScore
                  score={r.score}
                  graceWindow={r.graceWindow}
                  overBudgetBy={r.overBudgetBy}
                  matchReasons={r.matchReasons}
                />
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
