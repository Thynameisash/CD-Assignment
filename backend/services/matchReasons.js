/**
 * Generate human-readable match reasons from TOPSIS raw scores.
 * Presentation concern — separate from the ranking algorithm itself.
 */

const THRESHOLD = 0.75;
const MAX_REASONS = 3;

/**
 * Criteria-to-reason mapping. Each entry defines:
 * - key: rawScore field name
 * - reason: function returning the strong-match label
 * - fallback: function returning the weak-match / fallback label
 */
const CRITERIA_LABELS = [
  {
    key: 'budgetFit',
    reason: (_prefs, car, budget) =>
      car.price <= budget
        ? 'Within your budget'
        : `Slight stretch — $${(car.price - budget).toLocaleString()} over`,
    fallback: () => 'Good value for money',
  },
  {
    key: 'useCaseFit',
    reason: (prefs) => `Great for ${[].concat(prefs.useCase).join(' & ')} driving`,
    fallback: (prefs) => `Suitable for ${[].concat(prefs.useCase).join(' & ')} use`,
  },
  {
    key: 'fuelMatch',
    reason: () => 'Matches your fuel preference',
    fallback: (_prefs, car) => `${car.fuel_type} powertrain`,
  },
  {
    key: 'seatingMatch',
    reason: (_prefs, car) => `Seats ${car.seating_capacity} — just right`,
    fallback: (_prefs, car) => `Seats ${car.seating_capacity}`,
  },
  {
    key: 'priorityAttr',
    reason: (prefs) => `Top-tier ${[].concat(prefs.topPriority).join(' & ')}`,
    fallback: (prefs) => `Solid ${[].concat(prefs.topPriority).join(' & ')}`,
  },
  {
    key: 'safetyRating',
    reason: () => 'Excellent safety rating',
    fallback: (_prefs, car) => `${car.safety_rating}★ safety`,
  },
  {
    key: 'userRating',
    reason: () => 'Highly rated by owners',
    fallback: (_prefs, car) => `${car.user_rating}★ owner rating`,
  },
];

function generateMatchReasons(rawScores, prefs, car, budget) {
  // Collect strong matches (score >= threshold)
  const reasons = CRITERIA_LABELS
    .filter(({ key }) => rawScores[key] >= THRESHOLD)
    .map(({ reason }) => reason(prefs, car, budget));

  // Pad with fallbacks from top-scoring criteria if fewer than 2
  if (reasons.length < 2) {
    const sorted = [...CRITERIA_LABELS].sort((a, b) => rawScores[b.key] - rawScores[a.key]);
    for (const { fallback } of sorted) {
      if (reasons.length >= MAX_REASONS) break;
      const label = fallback(prefs, car, budget);
      if (!reasons.includes(label)) {
        reasons.push(label);
      }
    }
  }

  return reasons.slice(0, MAX_REASONS);
}

module.exports = { generateMatchReasons };
