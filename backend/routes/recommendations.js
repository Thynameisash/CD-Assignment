const express = require('express');
const router = express.Router();
const { validateBody } = require('../middleware/validate');
const recommendationService = require('../services/recommendationService');

const recommendationSchema = {
  budget: { required: true, type: 'number', min: 1000, max: 500000 },
  budgetMode: { required: true, type: 'string', enum: ['strict', 'flexible'] },
  useCase: { required: true, type: 'string', allowArray: true, enum: ['city', 'highway', 'offroad', 'family'] },
  fuelPreference: {
    required: true,
    type: 'string',
    allowArray: true,
    enum: ['petrol', 'diesel', 'electric', 'hybrid', 'no_preference'],
  },
  seatingNeed: { required: true, type: 'number', allowArray: true, enum: [2, 4, 5, 7, 8] },
  topPriority: {
    required: true,
    type: 'string',
    allowArray: true,
    enum: ['safety', 'mileage', 'performance', 'value'],
  },
};

/**
 * POST /api/recommendations
 * Quiz-based car recommendations using TOPSIS.
 */
router.post('/', validateBody(recommendationSchema), (req, res) => {
  const result = recommendationService.recommend(req.body);
  res.json(result);
});

module.exports = router;
