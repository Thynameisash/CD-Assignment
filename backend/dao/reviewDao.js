const db = require('../db/connection');

/**
 * Data Access Object for the `reviews` table.
 */

const reviewDao = {
  /**
   * Find all reviews for a given car, newest first.
   */
  findByCarId(carId) {
    return db
      .prepare('SELECT * FROM reviews WHERE car_id = ? ORDER BY created_at DESC')
      .all(carId);
  },
};

module.exports = reviewDao;
