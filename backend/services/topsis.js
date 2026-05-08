/**
 * Use-case to preferred body types mapping.
 */
const USE_CASE_BODY_MAP = {
  city: ['hatchback', 'sedan'],
  highway: ['sedan', 'coupe'],
  offroad: ['suv', 'truck'],
  family: ['suv', 'minivan'],
};

/**
 * TOPSIS criteria weights and raw-score derivation functions.
 * All criteria are "benefit" direction (higher = better).
 */
const CRITERIA = [
  { name: 'budgetFit', weight: 0.25 },
  { name: 'useCaseFit', weight: 0.20 },
  { name: 'fuelMatch', weight: 0.15 },
  { name: 'seatingMatch', weight: 0.10 },
  { name: 'priorityAttr', weight: 0.15 },
  { name: 'safetyRating', weight: 0.10 },
  { name: 'userRating', weight: 0.05 },
];

/**
 * Build a raw score row for a single car against user preferences.
 */
function buildRawScores(car, prefs) {
  const { budget } = prefs;

  // Normalize multi-select fields to arrays
  const useCases = [].concat(prefs.useCase);
  const fuelPrefs = [].concat(prefs.fuelPreference);
  const seatingNeeds = [].concat(prefs.seatingNeed);
  const priorities = [].concat(prefs.topPriority);

  // Budget fit: 1 - |price - budget| / budget, clamped [0, 1]
  const budgetFit = Math.max(0, Math.min(1, 1 - Math.abs(car.price - budget) / budget));

  // Use-case fit: union of best body types from all selected use cases
  const bestBodies = new Set(useCases.flatMap((uc) => USE_CASE_BODY_MAP[uc] || []));
  const useCaseFit = bestBodies.has(car.body_type) ? 1.0 : 0.0;

  // Fuel match: best match across selected preferences
  let fuelMatch;
  if (fuelPrefs.includes('no_preference')) {
    fuelMatch = fuelPrefs.includes(car.fuel_type) ? 1.0 : 0.5;
  } else {
    fuelMatch = fuelPrefs.includes(car.fuel_type) ? 1.0 : 0.0;
  }

  // Seating match: best match across selected seat counts
  const seatingMatch = Math.max(...seatingNeeds.map((need) => {
    const diff = Math.abs(car.seating_capacity - need);
    switch (diff) {
      case 0:  return 1.0;
      case 1:  return 0.5;
      default: return 0.0;
    }
  }));

  // Priority attribute: max score across selected priorities
  const priorityScorer = (p) => {
    switch (p) {
      case 'safety':      return car.safety_rating / 5.0;
      case 'mileage':     return Math.min(1, car.mileage / 25.0);
      case 'performance': return Math.min(1, car.horsepower / 560);
      case 'value':       return Math.min(1, ((car.user_rating / 5.0) + (1 - car.price / 85000)) / 2);
      default:            return 0.5;
    }
  };
  const priorityAttr = Math.max(...priorities.map(priorityScorer));

  const safetyRating = car.safety_rating / 5.0;
  const userRating = car.user_rating / 5.0;

  return { budgetFit, useCaseFit, fuelMatch, seatingMatch, priorityAttr, safetyRating, userRating };
}

/**
 * Run TOPSIS ranking on a list of candidate cars.
 *
 * @param {Array} cars - Array of car DB rows
 * @param {Object} prefs - User preferences from quiz
 * @returns {Array} Ranked results with closeness coefficients
 */
function rankCars(cars, prefs) {
  if (cars.length === 0) return [];

  // Step 1: Build decision matrix (raw scores)
  const matrix = cars.map((car) => ({
    car,
    scores: buildRawScores(car, prefs),
  }));

  const criteriaNames = CRITERIA.map((c) => c.name);

  // Step 2: Vector-normalize each column
  // Compute column norms: sqrt(sum of squares)
  const columnNorms = {};
  for (const name of criteriaNames) {
    const sumSq = matrix.reduce((acc, row) => acc + row.scores[name] ** 2, 0);
    columnNorms[name] = Math.sqrt(sumSq) || 1; // avoid division by zero
  }

  // Normalized + weighted matrix
  const weighted = matrix.map((row) => {
    const v = {};
    for (const { name, weight } of CRITERIA) {
      v[name] = (row.scores[name] / columnNorms[name]) * weight;
    }
    return { car: row.car, rawScores: row.scores, v };
  });

  // Step 3: Ideal best (A+) and ideal worst (A-)
  const idealBest = {};
  const idealWorst = {};
  for (const name of criteriaNames) {
    const values = weighted.map((r) => r.v[name]);
    idealBest[name] = Math.max(...values);
    idealWorst[name] = Math.min(...values);
  }

  // Step 4: Euclidean distances & closeness coefficient
  const results = weighted.map((row) => {
    let dPlus = 0;
    let dMinus = 0;
    for (const name of criteriaNames) {
      dPlus += (row.v[name] - idealBest[name]) ** 2;
      dMinus += (row.v[name] - idealWorst[name]) ** 2;
    }
    dPlus = Math.sqrt(dPlus);
    dMinus = Math.sqrt(dMinus);

    const closeness = dPlus + dMinus === 0 ? 0 : dMinus / (dPlus + dMinus);

    return {
      car: row.car,
      rawScores: row.rawScores,
      closenessCoefficient: Math.round(closeness * 100) / 100,
    };
  });

  // Step 5: Sort by closeness descending
  results.sort((a, b) => b.closenessCoefficient - a.closenessCoefficient);

  return results;
}

module.exports = { rankCars };
