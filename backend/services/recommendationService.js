const carDao = require('../dao/carDao');
const { formatCar } = require('../utils/formatters');
const { rankCars } = require('./topsis');
const { generateMatchReasons } = require('./matchReasons');
const { BUDGET_GRACE_AMOUNT } = require('../utils/constants');

/**
 * Service layer for quiz-based recommendation logic.
 */

const recommendationService = {
  /**
   * Run TOPSIS-based recommendation for the given preferences.
   *
   * @param {Object} prefs - Validated quiz answers { budget, budgetMode, useCase, fuelPreference, seatingNeed, topPriority }
   * @returns {{ data: Array }} Top-10 ranked car recommendations
   */
  recommend(prefs) {
    const { budget, budgetMode } = prefs;
    const maxPrice = budgetMode === 'strict' ? budget : budget + BUDGET_GRACE_AMOUNT;

    const candidates = carDao.findByMaxPrice(maxPrice);
    if (candidates.length === 0) return { data: [] };

    const ranked = rankCars(candidates, prefs);

    const data = ranked.slice(0, 10).map((result) => {
      const isGrace =
        result.car.price > budget && result.car.price <= budget + BUDGET_GRACE_AMOUNT;

      return {
        car: formatCar(result.car),
        score: Math.round(result.closenessCoefficient * 100),
        closenessCoefficient: result.closenessCoefficient,
        graceWindow: isGrace,
        overBudgetBy: isGrace ? result.car.price - budget : 0,
        matchReasons: generateMatchReasons(result.rawScores, prefs, result.car, budget),
      };
    });

    return { data };
  },
};

module.exports = recommendationService;
