import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import CarCard from '../components/CarCard';
import Spinner from '../components/Spinner';

export default function Browse() {
  const [cars, setCars] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [filterOptions, setFilterOptions] = useState(null);
  const [loading, setLoading] = useState(true);

  const INITIAL_FILTERS = {
    make: '',
    bodyType: '',
    fuelType: '',
    minPrice: '',
    maxPrice: '',
    minSafetyRating: '',
    sortBy: 'price',
    sortOrder: 'asc',
  };

  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [draftFilters, setDraftFilters] = useState(INITIAL_FILTERS);
  const [page, setPage] = useState(1);

  useEffect(() => {
    api.getFilters().then(setFilterOptions).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = { page, limit: 9 };
    Object.entries(filters).forEach(([k, v]) => {
      if (v) params[k] = v;
    });
    api
      .getCars(params)
      .then((res) => {
        setCars(res.data);
        setPagination(res.pagination);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [filters, page]);

  const handleDraft = (key, value) => {
    setDraftFilters((prev) => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    setFilters({ ...draftFilters });
    setPage(1);
  };

  const clearFilters = () => {
    setDraftFilters(INITIAL_FILTERS);
    setFilters(INITIAL_FILTERS);
    setPage(1);
  };

  const draftActiveCount = Object.entries(draftFilters)
    .filter(([k, v]) => v && k !== 'sortBy' && k !== 'sortOrder')
    .length;

  const hasChanges = JSON.stringify(filters) !== JSON.stringify(draftFilters);

  return (
    <div className="mx-auto flex max-w-7xl gap-6 px-4 py-8">
      {/* Filters Sidebar */}
      <aside className="hidden w-56 shrink-0 lg:block">
        <div className="sticky top-20 space-y-4 rounded-lg border border-border bg-white p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900">
              Filters{draftActiveCount > 0 && ` (${draftActiveCount})`}
            </h3>
            {draftActiveCount > 0 && (
              <button onClick={clearFilters} className="text-xs text-primary-600 hover:underline">
                Clear
              </button>
            )}
          </div>

          {/* Make */}
          {filterOptions && (
            <>
              <label className="block">
                <span className="text-xs text-gray-500">Make</span>
                <select
                  value={draftFilters.make}
                  onChange={(e) => handleDraft('make', e.target.value)}
                  className="mt-1 w-full rounded border border-border px-2 py-1.5 text-sm outline-none focus:border-primary-400"
                >
                  <option value="">All Makes</option>
                  {filterOptions.makes.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </label>

              {/* Body Type */}
              <div>
                <span className="text-xs text-gray-500">Body Type</span>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {filterOptions.bodyTypes.map((bt) => (
                    <button
                      key={bt}
                      onClick={() => handleDraft('bodyType', draftFilters.bodyType === bt ? '' : bt)}
                      className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                        draftFilters.bodyType === bt
                          ? 'bg-primary-100 text-primary-700'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {bt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Fuel Type */}
              <div>
                <span className="text-xs text-gray-500">Fuel Type</span>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {filterOptions.fuelTypes.map((ft) => (
                    <button
                      key={ft}
                      onClick={() => handleDraft('fuelType', draftFilters.fuelType === ft ? '' : ft)}
                      className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                        draftFilters.fuelType === ft
                          ? 'bg-primary-100 text-primary-700'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {ft}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="flex gap-2">
                <label className="flex-1">
                  <span className="text-xs text-gray-500">Min $</span>
                  <input
                    type="number"
                    placeholder={filterOptions.priceRange.min}
                    value={draftFilters.minPrice}
                    onChange={(e) => handleDraft('minPrice', e.target.value)}
                    className="mt-1 w-full rounded border border-border px-2 py-1.5 text-sm outline-none focus:border-primary-400"
                  />
                </label>
                <label className="flex-1">
                  <span className="text-xs text-gray-500">Max $</span>
                  <input
                    type="number"
                    placeholder={filterOptions.priceRange.max}
                    value={draftFilters.maxPrice}
                    onChange={(e) => handleDraft('maxPrice', e.target.value)}
                    className="mt-1 w-full rounded border border-border px-2 py-1.5 text-sm outline-none focus:border-primary-400"
                  />
                </label>
              </div>

              {/* Safety */}
              <label className="block">
                <span className="text-xs text-gray-500">Min Safety ★</span>
                <select
                  value={draftFilters.minSafetyRating}
                  onChange={(e) => handleDraft('minSafetyRating', e.target.value)}
                  className="mt-1 w-full rounded border border-border px-2 py-1.5 text-sm outline-none focus:border-primary-400"
                >
                  <option value="">Any</option>
                  {[3, 3.5, 4, 4.5].map((v) => (
                    <option key={v} value={v}>≥ {v}★</option>
                  ))}
                </select>
              </label>

              <button
                onClick={applyFilters}
                disabled={!hasChanges}
                className="w-full rounded-lg bg-primary-600 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-700 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Apply Filters
              </button>
            </>
          )}
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Showing {cars.length} of {pagination.total} cars
          </p>
          <div className="flex items-center gap-2">
            <select
              value={`${draftFilters.sortBy}_${draftFilters.sortOrder}`}
              onChange={(e) => {
                const [sortBy, sortOrder] = e.target.value.split('_');
                setDraftFilters((prev) => ({ ...prev, sortBy, sortOrder }));
              }}
              className="rounded border border-border px-2 py-1.5 text-sm outline-none focus:border-primary-400"
            >
              <option value="price_asc">Price ↑</option>
              <option value="price_desc">Price ↓</option>
              <option value="mileage_desc">Mileage ↓</option>
              <option value="safety_rating_desc">Safety ↓</option>
              <option value="user_rating_desc">Rating ↓</option>
            </select>
          </div>
        </div>

        {loading ? (
          <Spinner />
        ) : cars.length === 0 ? (
          <p className="py-12 text-center text-sm text-gray-500">No cars found. Try adjusting your filters.</p>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {cars.map((car) => (
                <CarCard key={car.id} car={car} />
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="mt-6 flex items-center justify-center gap-1">
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`h-8 w-8 rounded text-sm font-medium transition-colors ${
                      p === page
                        ? 'bg-primary-600 text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
