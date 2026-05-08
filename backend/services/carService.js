const carDao = require('../dao/carDao');
const reviewDao = require('../dao/reviewDao');
const { formatCar, buildPagination } = require('../utils/formatters');
const { parseIntParam, parseFloatParam } = require('../utils/parsers');

/**
 * Service layer for car-related business logic.
 * Routes call these methods — no DB access in routes.
 */

const ALLOWED_SORTS = ['price', 'mileage', 'safety_rating', 'user_rating'];

const carService = {
  /**
   * List cars with filtering, sorting, and pagination.
   */
  list(query) {
    const page = parseIntParam(query.page, 1, 1);
    const limit = parseIntParam(query.limit, 9, 1, 50);
    const offset = (page - 1) * limit;

    const { whereClause, params } = buildWhereClause(query);
    const sortBy = ALLOWED_SORTS.includes(query.sortBy) ? query.sortBy : 'price';
    const sortOrder = query.sortOrder === 'desc' ? 'DESC' : 'ASC';

    const total = carDao.count(whereClause, params);
    const rows = carDao.findAll({ whereClause, params, sortBy, sortOrder, limit, offset });

    return {
      data: rows.map(formatCar),
      pagination: buildPagination(page, limit, total),
    };
  },

  /**
   * Get aggregated filter options for the browse page.
   */
  getFilters() {
    return {
      makes: carDao.getDistinctMakes(),
      bodyTypes: carDao.getDistinctBodyTypes(),
      fuelTypes: carDao.getDistinctFuelTypes(),
      priceRange: carDao.getPriceRange(),
      years: carDao.getDistinctYears(),
    };
  },

  /**
   * Get a single car with its reviews.
   * Returns null if not found.
   */
  getDetail(carId) {
    const row = carDao.findById(carId);
    if (!row) return null;

    const reviews = reviewDao.findByCarId(carId);
    return { ...formatCar(row), reviews };
  },
};

// ─── Private helpers ───────────────────────────────────────

/**
 * Build a SQL WHERE clause + params array from query string filters.
 */
/**
 * Filter config: maps query param → SQL column + parser.
 * Add a new row here to support a new filter — no other changes needed.
 */
const FILTER_CONFIG = [
  { param: 'make',            column: 'make',          op: '=' },
  { param: 'bodyType',        column: 'body_type',     op: '=' },
  { param: 'fuelType',        column: 'fuel_type',     op: '=' },
  { param: 'minPrice',        column: 'price',         op: '>=', parse: (v) => parseIntParam(v, 0, 0) },
  { param: 'maxPrice',        column: 'price',         op: '<=', parse: (v) => parseIntParam(v, 999999, 0) },
  { param: 'minSafetyRating', column: 'safety_rating', op: '>=', parse: (v) => parseFloatParam(v, 0) },
];

function buildWhereClause(query) {
  const conditions = [];
  const params = [];

  for (const { param, column, op, parse } of FILTER_CONFIG) {
    if (!query[param]) continue;
    conditions.push(`${column} ${op} ?`);
    params.push(parse ? parse(query[param]) : query[param]);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  return { whereClause, params };
}

module.exports = carService;
