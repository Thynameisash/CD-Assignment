const express = require('express');
const cors = require('cors');
const db = require('./db/connection');
const runSeed = require('./db/seed');
const carDao = require('./dao/carDao');
const carsRouter = require('./routes/cars');
const recommendationsRouter = require('./routes/recommendations');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Seed database on startup (idempotent)
runSeed(db);

// Routes
app.use('/api/cars', carsRouter);
app.use('/api/recommendations', recommendationsRouter);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', carsInDb: carDao.getTotalCount() });
});

// Error handler
app.use((err, _req, res, _next) => {
  console.error('[error]', err.message);
  res.status(500).json({ error: 'Internal server error' });
});

// Only start listening when run directly (not when imported for tests)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`[server] CarFinder API running on http://localhost:${PORT}`);
  });
}

module.exports = app;
