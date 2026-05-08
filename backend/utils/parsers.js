/**
 * Shared param-parsing utilities.
 * NOT middleware — pure functions used by services and routes.
 */

/**
 * Sanitize and parse integer values with defaults and bounds.
 */
function parseIntParam(value, defaultVal, min, max) {
  const parsed = parseInt(value, 10);
  if (isNaN(parsed)) return defaultVal;
  if (min !== undefined && parsed < min) return min;
  if (max !== undefined && parsed > max) return max;
  return parsed;
}

/**
 * Sanitize and parse float values with a default.
 */
function parseFloatParam(value, defaultVal) {
  const parsed = parseFloat(value);
  return isNaN(parsed) ? defaultVal : parsed;
}

module.exports = { parseIntParam, parseFloatParam };
