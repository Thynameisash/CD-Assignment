-- Cars table
CREATE TABLE IF NOT EXISTS cars (
  id TEXT PRIMARY KEY,
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  variant TEXT NOT NULL,
  year INTEGER NOT NULL,
  price INTEGER NOT NULL,
  body_type TEXT NOT NULL CHECK (body_type IN ('sedan', 'suv', 'hatchback', 'truck', 'coupe', 'minivan')),
  fuel_type TEXT NOT NULL CHECK (fuel_type IN ('petrol', 'diesel', 'electric', 'hybrid')),
  transmission TEXT NOT NULL CHECK (transmission IN ('automatic', 'manual')),
  engine_capacity_cc INTEGER,
  horsepower INTEGER NOT NULL,
  mileage REAL NOT NULL,
  seating_capacity INTEGER NOT NULL,
  safety_rating REAL NOT NULL CHECK (safety_rating >= 1.0 AND safety_rating <= 5.0),
  user_rating REAL NOT NULL CHECK (user_rating >= 1.0 AND user_rating <= 5.0),
  review_count INTEGER NOT NULL DEFAULT 0,
  features TEXT NOT NULL DEFAULT '[]',
  pros TEXT NOT NULL DEFAULT '[]',
  cons TEXT NOT NULL DEFAULT '[]',
  image_url TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id TEXT PRIMARY KEY,
  car_id TEXT NOT NULL,
  author TEXT NOT NULL,
  rating REAL NOT NULL CHECK (rating >= 1.0 AND rating <= 5.0),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (car_id) REFERENCES cars(id) ON DELETE CASCADE
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_cars_make ON cars(make);
CREATE INDEX IF NOT EXISTS idx_cars_body_type ON cars(body_type);
CREATE INDEX IF NOT EXISTS idx_cars_fuel_type ON cars(fuel_type);
CREATE INDEX IF NOT EXISTS idx_cars_price ON cars(price);
CREATE INDEX IF NOT EXISTS idx_cars_safety_rating ON cars(safety_rating);
CREATE INDEX IF NOT EXISTS idx_reviews_car_id ON reviews(car_id);
