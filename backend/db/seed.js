const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

function runSeed(db) {
  const count = db.prepare('SELECT COUNT(*) as count FROM cars').get().count;
  if (count > 0) {
    console.log(`[seed] Database already has ${count} cars — skipping seed.`);
    return;
  }

  const carsPath = path.join(__dirname, '..', 'seed', 'cars.json');
  const rawCars = JSON.parse(fs.readFileSync(carsPath, 'utf-8'));

  const insertCar = db.prepare(`
    INSERT INTO cars (id, make, model, variant, year, price, body_type, fuel_type,
      transmission, engine_capacity_cc, horsepower, mileage, seating_capacity,
      safety_rating, user_rating, review_count, features, pros, cons, image_url)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertReview = db.prepare(`
    INSERT INTO reviews (id, car_id, author, rating, title, body)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const seedAll = db.transaction(() => {
    for (const car of rawCars) {
      const reviews = car.reviews || [];
      const avgRating =
        reviews.length > 0
          ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length) * 10) / 10
          : 3.0;

      insertCar.run(
        car.id,
        car.make,
        car.model,
        car.variant,
        car.year,
        car.price,
        car.bodyType,
        car.fuelType,
        car.transmission,
        car.engineCapacityCC,
        car.horsepower,
        car.mileage,
        car.seatingCapacity,
        car.safetyRating,
        avgRating,
        reviews.length,
        JSON.stringify(car.features || []),
        JSON.stringify(car.pros || []),
        JSON.stringify(car.cons || []),
        car.imageUrl || ''
      );

      for (const review of reviews) {
        insertReview.run(
          uuidv4(),
          car.id,
          review.author,
          review.rating,
          review.title,
          review.body
        );
      }
    }
  });

  seedAll();
  console.log(`[seed] Inserted ${rawCars.length} cars with reviews.`);
}

// Allow running directly: node db/seed.js
if (require.main === module) {
  const db = require('./connection');
  runSeed(db);
  process.exit(0);
}

module.exports = runSeed;
