/**
 * Shared formatting utilities.
 * Single source of truth for transforming DB rows to API response shapes.
 */

/**
 * Transform a raw car DB row (snake_case + JSON strings) into
 * a camelCase API response object.
 */
function formatCar(row) {
  return {
    id: row.id,
    make: row.make,
    model: row.model,
    variant: row.variant,
    year: row.year,
    price: row.price,
    bodyType: row.body_type,
    fuelType: row.fuel_type,
    transmission: row.transmission,
    engineCapacityCC: row.engine_capacity_cc,
    horsepower: row.horsepower,
    mileage: row.mileage,
    seatingCapacity: row.seating_capacity,
    safetyRating: row.safety_rating,
    userRating: row.user_rating,
    reviewCount: row.review_count,
    features: parseJsonField(row.features),
    pros: parseJsonField(row.pros),
    cons: parseJsonField(row.cons),
    imageUrl: row.image_url,
    createdAt: row.created_at,
  };
}

/**
 * Safely parse a JSON string field, returning [] on failure.
 */
function parseJsonField(value) {
  try {
    return JSON.parse(value || '[]');
  } catch {
    return [];
  }
}

/**
 * Build pagination metadata object.
 */
function buildPagination(page, limit, total) {
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
}

module.exports = { formatCar, parseJsonField, buildPagination };
