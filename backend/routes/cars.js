const express = require('express');
const router = express.Router();
const carService = require('../services/carService');
const compareService = require('../services/compareService');

/**
 * GET /api/cars
 * List cars with filtering, sorting, and pagination.
 */
router.get('/', (req, res) => {
  const result = carService.list(req.query);
  res.json(result);
});

/**
 * GET /api/cars/filters
 * Get distinct filter options + ranges.
 */
router.get('/filters', (_req, res) => {
  res.json(carService.getFilters());
});

/**
 * GET /api/cars/compare?ids=id1,id2,id3
 * Compare 2-3 cars side by side.
 */
router.get('/compare', (req, res) => {
  try {
    const result = compareService.compare(req.query.ids);
    res.json(result);
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    throw err;
  }
});

/**
 * GET /api/cars/:id
 * Get a single car with reviews.
 */
router.get('/:id', (req, res) => {
  const car = carService.getDetail(req.params.id);
  if (!car) {
    return res.status(404).json({ error: 'Car not found' });
  }

  res.json(car);
});

module.exports = router;
