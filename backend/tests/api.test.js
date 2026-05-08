const request = require('supertest');
const app = require('../index');

describe('GET /api/health', () => {
  it('returns status ok with car count', async () => {
    const res = await request(app).get('/api/health');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.carsInDb).toBeGreaterThanOrEqual(1);
  });
});

describe('GET /api/cars', () => {
  it('returns paginated list with defaults', async () => {
    const res = await request(app).get('/api/cars');

    expect(res.status).toBe(200);
    expect(res.body.data).toBeInstanceOf(Array);
    expect(res.body.data.length).toBeLessThanOrEqual(9);
    expect(res.body.pagination).toMatchObject({
      page: 1,
      limit: 9,
    });
    expect(res.body.pagination.total).toBeGreaterThanOrEqual(1);
    expect(res.body.pagination.totalPages).toBeGreaterThanOrEqual(1);
  });

  it('respects page and limit params', async () => {
    const res = await request(app).get('/api/cars?page=2&limit=3');

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeLessThanOrEqual(3);
    expect(res.body.pagination.page).toBe(2);
    expect(res.body.pagination.limit).toBe(3);
  });

  it('filters by make', async () => {
    const res = await request(app).get('/api/cars?make=Toyota');

    expect(res.status).toBe(200);
    res.body.data.forEach((car) => {
      expect(car.make).toBe('Toyota');
    });
  });

  it('filters by bodyType', async () => {
    const res = await request(app).get('/api/cars?bodyType=suv');

    expect(res.status).toBe(200);
    res.body.data.forEach((car) => {
      expect(car.bodyType).toBe('suv');
    });
  });

  it('filters by price range', async () => {
    const res = await request(app).get('/api/cars?minPrice=25000&maxPrice=35000');

    expect(res.status).toBe(200);
    res.body.data.forEach((car) => {
      expect(car.price).toBeGreaterThanOrEqual(25000);
      expect(car.price).toBeLessThanOrEqual(35000);
    });
  });

  it('sorts by mileage descending', async () => {
    const res = await request(app).get('/api/cars?sortBy=mileage&sortOrder=desc');

    expect(res.status).toBe(200);
    const mileages = res.body.data.map((c) => c.mileage);
    for (let i = 1; i < mileages.length; i++) {
      expect(mileages[i]).toBeLessThanOrEqual(mileages[i - 1]);
    }
  });

  it('returns camelCase fields with parsed JSON arrays', async () => {
    const res = await request(app).get('/api/cars?limit=1');

    expect(res.status).toBe(200);
    const car = res.body.data[0];
    expect(car).toHaveProperty('bodyType');
    expect(car).toHaveProperty('fuelType');
    expect(car).toHaveProperty('safetyRating');
    expect(car.features).toBeInstanceOf(Array);
    expect(car.pros).toBeInstanceOf(Array);
    expect(car.cons).toBeInstanceOf(Array);
  });
});

describe('GET /api/cars/filters', () => {
  it('returns all filter option categories', async () => {
    const res = await request(app).get('/api/cars/filters');

    expect(res.status).toBe(200);
    expect(res.body.makes).toBeInstanceOf(Array);
    expect(res.body.makes.length).toBeGreaterThan(0);
    expect(res.body.bodyTypes).toBeInstanceOf(Array);
    expect(res.body.fuelTypes).toBeInstanceOf(Array);
    expect(res.body.priceRange).toHaveProperty('min');
    expect(res.body.priceRange).toHaveProperty('max');
    expect(res.body.priceRange.min).toBeLessThan(res.body.priceRange.max);
    expect(res.body.years).toBeInstanceOf(Array);
  });
});

describe('GET /api/cars/:id', () => {
  it('returns a single car with reviews', async () => {
    const res = await request(app).get('/api/cars/c001');

    expect(res.status).toBe(200);
    expect(res.body.id).toBe('c001');
    expect(res.body.make).toBe('Toyota');
    expect(res.body.model).toBe('Camry');
    expect(res.body.reviews).toBeInstanceOf(Array);
    expect(res.body.reviews.length).toBeGreaterThanOrEqual(1);
    expect(res.body.reviews[0]).toHaveProperty('author');
    expect(res.body.reviews[0]).toHaveProperty('rating');
    expect(res.body.reviews[0]).toHaveProperty('title');
    expect(res.body.reviews[0]).toHaveProperty('body');
  });

  it('returns 404 for non-existent car', async () => {
    const res = await request(app).get('/api/cars/nonexistent');

    expect(res.status).toBe(404);
    expect(res.body.error).toBeDefined();
  });
});

describe('GET /api/cars/compare', () => {
  it('compares 2 cars with highlights and radar data', async () => {
    const res = await request(app).get('/api/cars/compare?ids=c001,c002');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
    expect(res.body.highlights).toHaveProperty('lowestPrice');
    expect(res.body.highlights).toHaveProperty('bestMileage');
    expect(res.body.highlights).toHaveProperty('highestSafety');
    expect(res.body.highlights).toHaveProperty('bestUserRating');
    expect(res.body.highlights).toHaveProperty('mostPowerful');
    expect(res.body.radarData).toBeInstanceOf(Array);
    expect(res.body.radarData.length).toBe(5);
    res.body.radarData.forEach((dim) => {
      expect(dim).toHaveProperty('dimension');
      expect(dim).toHaveProperty('c001');
      expect(dim).toHaveProperty('c002');
    });
  });

  it('compares 3 cars', async () => {
    const res = await request(app).get('/api/cars/compare?ids=c001,c002,c003');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(3);
  });

  it('rejects fewer than 2 IDs', async () => {
    const res = await request(app).get('/api/cars/compare?ids=c001');

    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  it('rejects more than 3 IDs', async () => {
    const res = await request(app).get('/api/cars/compare?ids=c001,c002,c003,c004');

    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  it('rejects missing ids param', async () => {
    const res = await request(app).get('/api/cars/compare');

    expect(res.status).toBe(400);
  });

  it('returns 404 for non-existent car IDs', async () => {
    const res = await request(app).get('/api/cars/compare?ids=c001,fake');

    expect(res.status).toBe(404);
  });
});

describe('POST /api/recommendations', () => {
  const validBody = {
    budget: 35000,
    budgetMode: 'flexible',
    useCase: 'city',
    fuelPreference: 'no_preference',
    seatingNeed: 5,
    topPriority: 'safety',
  };

  it('returns ranked recommendations with scores and reasons', async () => {
    const res = await request(app)
      .post('/api/recommendations')
      .send(validBody);

    expect(res.status).toBe(200);
    expect(res.body.data).toBeInstanceOf(Array);
    expect(res.body.data.length).toBeLessThanOrEqual(10);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);

    const top = res.body.data[0];
    expect(top.car).toHaveProperty('id');
    expect(top.car).toHaveProperty('make');
    expect(top.car).toHaveProperty('price');
    expect(top.score).toBeGreaterThanOrEqual(0);
    expect(top.score).toBeLessThanOrEqual(100);
    expect(top.closenessCoefficient).toBeGreaterThanOrEqual(0);
    expect(top.closenessCoefficient).toBeLessThanOrEqual(1);
    expect(typeof top.graceWindow).toBe('boolean');
    expect(top.matchReasons).toBeInstanceOf(Array);
    expect(top.matchReasons.length).toBeGreaterThanOrEqual(1);
  });

  it('returns results sorted by score descending', async () => {
    const res = await request(app)
      .post('/api/recommendations')
      .send(validBody);

    const scores = res.body.data.map((r) => r.score);
    for (let i = 1; i < scores.length; i++) {
      expect(scores[i]).toBeLessThanOrEqual(scores[i - 1]);
    }
  });

  it('strict mode excludes cars above budget', async () => {
    const res = await request(app)
      .post('/api/recommendations')
      .send({ ...validBody, budget: 30000, budgetMode: 'strict' });

    expect(res.status).toBe(200);
    res.body.data.forEach((r) => {
      expect(r.car.price).toBeLessThanOrEqual(30000);
      expect(r.graceWindow).toBe(false);
    });
  });

  it('flexible mode tags grace window cars correctly', async () => {
    const res = await request(app)
      .post('/api/recommendations')
      .send({ ...validBody, budget: 25000, budgetMode: 'flexible' });

    expect(res.status).toBe(200);
    res.body.data.forEach((r) => {
      expect(r.car.price).toBeLessThanOrEqual(28000); // 25000 + 3000 grace
      if (r.car.price > 25000) {
        expect(r.graceWindow).toBe(true);
        expect(r.overBudgetBy).toBe(r.car.price - 25000);
      } else {
        expect(r.graceWindow).toBe(false);
        expect(r.overBudgetBy).toBe(0);
      }
    });
  });

  it('rejects missing required fields', async () => {
    const res = await request(app)
      .post('/api/recommendations')
      .send({ budget: 30000 });

    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  it('rejects invalid enum values', async () => {
    const res = await request(app)
      .post('/api/recommendations')
      .send({ ...validBody, useCase: 'spaceflight' });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain('useCase');
  });

  it('rejects budget below minimum', async () => {
    const res = await request(app)
      .post('/api/recommendations')
      .send({ ...validBody, budget: 500 });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain('budget');
  });

  it('returns empty array for impossible budget', async () => {
    const res = await request(app)
      .post('/api/recommendations')
      .send({ ...validBody, budget: 1000, budgetMode: 'strict' });

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
  });
});
