const db = require('../db/connection');

/**
 * Data Access Object for the `cars` table.
 * All SQL queries related to cars live here — nowhere else.
 */

const carDao = {
  /**
   * Count cars matching filter conditions.
   */
  count(whereClause = '', params = []) {
    return db.prepare(`SELECT COUNT(*) as total FROM cars ${whereClause}`).get(...params).total;
  },

  /**
   * Find cars with filtering, sorting, and pagination.
   */
  findAll({ whereClause = '', params = [], sortBy = 'price', sortOrder = 'ASC', limit, offset }) {
    return db
      .prepare(
        `SELECT * FROM cars ${whereClause} ORDER BY ${sortBy} ${sortOrder} LIMIT ? OFFSET ?`
      )
      .all(...params, limit, offset);
  },

  /**
   * Find a single car by ID.
   */
  findById(id) {
    return db.prepare('SELECT * FROM cars WHERE id = ?').get(id);
  },

  /**
   * Find multiple cars by an array of IDs.
   */
  findByIds(ids) {
    const placeholders = ids.map(() => '?').join(',');
    return db.prepare(`SELECT * FROM cars WHERE id IN (${placeholders})`).all(...ids);
  },

  /**
   * Find all cars at or below a given price.
   */
  findByMaxPrice(maxPrice) {
    return db.prepare('SELECT * FROM cars WHERE price <= ? ORDER BY price ASC').all(maxPrice);
  },

  /**
   * Get distinct values for filter dropdowns.
   */
  getDistinctMakes() {
    return db.prepare('SELECT DISTINCT make FROM cars ORDER BY make').all().map((r) => r.make);
  },

  getDistinctBodyTypes() {
    return db
      .prepare('SELECT DISTINCT body_type FROM cars ORDER BY body_type')
      .all()
      .map((r) => r.body_type);
  },

  getDistinctFuelTypes() {
    return db
      .prepare('SELECT DISTINCT fuel_type FROM cars ORDER BY fuel_type')
      .all()
      .map((r) => r.fuel_type);
  },

  getPriceRange() {
    return db.prepare('SELECT MIN(price) as min, MAX(price) as max FROM cars').get();
  },

  getDistinctYears() {
    return db.prepare('SELECT DISTINCT year FROM cars ORDER BY year').all().map((r) => r.year);
  },

  /**
   * Get total car count (unfiltered). Delegates to count().
   */
  getTotalCount() {
    return this.count();
  },
};

module.exports = carDao;
