const carDao = require('../dao/carDao');
const { formatCar } = require('../utils/formatters');

/**
 * Service for comparing 2-3 cars side by side.
 * Single responsibility: compare logic, highlights, radar data.
 */

const compareService = {
  /**
   * Compare 2-3 cars: return formatted cars, highlights, and radar data.
   * Throws { status, message } on validation/not-found errors.
   */
  compare(idsParam) {
    if (!idsParam) {
      throw { status: 400, message: 'Provide 2 or 3 car IDs via ?ids=id1,id2,id3' };
    }

    const ids = idsParam.split(',').map((id) => id.trim()).filter(Boolean);
    if (ids.length < 2 || ids.length > 3) {
      throw { status: 400, message: 'Provide 2 or 3 car IDs' };
    }

    const rows = carDao.findByIds(ids);
    if (rows.length !== ids.length) {
      throw { status: 404, message: 'One or more car IDs not found' };
    }

    const cars = rows.map(formatCar);
    return {
      data: cars,
      highlights: computeHighlights(cars),
      radarData: computeRadarData(cars),
    };
  },
};

// ─── Private helpers ───────────────────────────────────────

/**
 * Determine "best in group" highlights for a compare set.
 */
function computeHighlights(cars) {
  const best = (key, dir = 'max') =>
    cars.reduce((a, b) => (dir === 'max' ? (a[key] > b[key] ? a : b) : (a[key] < b[key] ? a : b))).id;

  return {
    lowestPrice: best('price', 'min'),
    bestMileage: best('mileage'),
    highestSafety: best('safetyRating'),
    bestUserRating: best('userRating'),
    mostPowerful: best('horsepower'),
  };
}

/**
 * Build radar chart data normalized 0-1 for a compare set.
 */
function computeRadarData(cars) {
  const maxPrice = Math.max(...cars.map((c) => c.price));
  const maxMileage = Math.max(...cars.map((c) => c.mileage));
  const maxHP = Math.max(...cars.map((c) => c.horsepower));

  const normalizers = {
    Price: (car) => (maxPrice > 0 ? 1 - car.price / maxPrice : 0),
    Mileage: (car) => (maxMileage > 0 ? car.mileage / maxMileage : 0),
    Horsepower: (car) => (maxHP > 0 ? car.horsepower / maxHP : 0),
    Safety: (car) => car.safetyRating / 5.0,
    'User Rating': (car) => car.userRating / 5.0,
  };

  return Object.entries(normalizers).map(([dimension, normalize]) => {
    const entry = { dimension };
    for (const car of cars) {
      entry[car.id] = Math.round(normalize(car) * 100) / 100;
    }
    return entry;
  });
}

module.exports = compareService;
