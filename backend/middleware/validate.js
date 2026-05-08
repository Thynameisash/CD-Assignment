/**
 * Validation middleware factory.
 * Returns an Express middleware that validates req.body or req.query
 * against a schema definition.
 */

function validateBody(schema) {
  return (req, res, next) => {
    const errors = [];

    for (const [field, rules] of Object.entries(schema)) {
      const value = req.body[field];

      if (rules.required && (value === undefined || value === null || value === '')) {
        errors.push(`${field} is required`);
        continue;
      }

      if (value === undefined || value === null) continue;

      // Array validation: accept a single value or an array of valid values
      if (rules.allowArray && Array.isArray(value)) {
        if (value.length === 0) {
          errors.push(`${field} must not be empty`);
        } else {
          for (const item of value) {
            if (rules.type === 'number' && typeof item !== 'number') {
              errors.push(`${field} items must be numbers`);
              break;
            }
            if (rules.type === 'string' && typeof item !== 'string') {
              errors.push(`${field} items must be strings`);
              break;
            }
            if (rules.enum && !rules.enum.includes(item)) {
              errors.push(`${field} items must be one of: ${rules.enum.join(', ')}`);
              break;
            }
          }
        }
        continue;
      }

      if (rules.type === 'number' && typeof value !== 'number') {
        errors.push(`${field} must be a number`);
      }

      if (rules.type === 'string' && typeof value !== 'string') {
        errors.push(`${field} must be a string`);
      }

      if (rules.enum && !rules.enum.includes(value)) {
        errors.push(`${field} must be one of: ${rules.enum.join(', ')}`);
      }

      if (rules.min !== undefined && value < rules.min) {
        errors.push(`${field} must be at least ${rules.min}`);
      }

      if (rules.max !== undefined && value > rules.max) {
        errors.push(`${field} must be at most ${rules.max}`);
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({ error: errors.join('; ') });
    }

    next();
  };
}

module.exports = { validateBody };
