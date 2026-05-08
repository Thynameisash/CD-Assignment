# CarFinder MVP — Functional Specification

**Version:** 1.0  
**Date:** 2026-05-08  
**Status:** Draft  

---

## 1. Overview

CarFinder is a web application that helps confused car buyers narrow down their options and arrive at a confident shortlist. The system provides a guided questionnaire ("Car Quiz"), smart filtering, comparison tools, and a persistent shortlist — all backed by a seeded dataset of 50–100 real-world cars.

## IMPORTANT :
MUST HAVE :
- As a buyer, I want to answer a few simple questions about my needs so the system can narrow down cars for me.
- As a buyer, I want to see a ranked list of matching cars with the match scores so I know which ones fit best.
- As a buyer, I want to understand WHY a car was recommended so I can trust the results.
- As a buyer, I want to compare 2-3 cars side-by-side so I can make a final decision.
- The Quiz asking for the use of car should allow MULTIPLE selections not just one. Eg - I can select Family + City both together. Same with other questions. ALLOW MULTIPLE SELECTION in answers.

SHOULD HAVE :
- As a buyer, I want to see a radar chart showing how cars compare across dimensions.
- As a buyer, I want to adjust my preferences and re-run the recommendation any time.

---

## 2. Hard Constraints (from Brief)

| # | Constraint | Compliance Check |
|---|-----------|-----------------|
| HC-1 | Working web app — runnable via single command (`npm run dev` or `docker compose up`) within 2 minutes | The project SHALL boot with a single `npm run dev` command from the repo root. |
| HC-2 | Full-stack — interactive frontend + non-trivial backend (persistence, computation, aggregation) | The backend SHALL persist car data, compute recommendation scores, and serve aggregated results via API. |
| HC-3 | Screen recording of entire build process | N/A — process deliverable, not code. |
| HC-4 | Time-boxed to 2–3 hours of actual work | Scope SHALL be limited to the MVP features defined in this spec. |

---

## 3. User Stories

### US-1: Guided Car Quiz
> *As a confused car buyer, I want to answer a short quiz about my preferences so that the system recommends cars that match my needs.*

- **US-1.1:** The system SHALL present a multi-step quiz with 5 questions covering: budget (free-form numeric input), budget flexibility toggle, primary use case (city/highway/offroad/family), fuel preference, seating needs, and top priority (safety / mileage / performance).
- **US-1.2:** The budget step SHALL accept a single dollar amount typed by the user (e.g., `$35,000`). The system SHALL infer the effective budget range as `[entered - $3,000 … entered + $3,000]` when the user selects "Flexible" mode, or `[$0 … entered]` when the user selects "Strict" mode.
- **US-1.3:** The budget step SHALL present a toggle: **"Strict — only within my budget"** vs. **"Flexible — okay to show ±$3K options"**. Default SHALL be Flexible.
- **US-1.4:** The system SHALL rank all cars using the TOPSIS algorithm (see Section 7.3) and return the top 10 ranked cars sorted by closeness-coefficient descending.
- **US-1.5:** Each recommendation card SHALL display: make, model, variant, price, a primary image placeholder, the TOPSIS closeness-coefficient as a percentage, and whether the car is within strict budget or within the grace window.
- **US-1.6:** Cars that fall within the ±$3K grace window but outside the strict budget SHALL be visually tagged as "Stretch Pick — $X over budget".
- **US-1.7:** Each recommendation card SHALL display 2–3 human-readable **match reasons** explaining WHY the car was recommended (e.g., "✓ Within budget", "✓ Best-in-class mileage", "✓ Matches your fuel preference"). The reasons SHALL be derived from the TOPSIS criteria scores — the top 2–3 criteria where the car scored highest relative to the ideal best.
- **US-1.8:** The results page SHALL display an "Adjust Preferences" sidebar/panel showing the user's current quiz answers. The user SHALL be able to change any individual preference (budget, use case, fuel, seating, priority) and click "Re-run" to re-submit to the API without restarting the full quiz flow.

### US-2: Browse & Filter
> *As a car buyer with some idea of what I want, I want to browse all cars and filter by key attributes so that I can explore options on my own.*

- **US-2.1:** The system SHALL display a paginated catalog of all cars, 9 per page in a 3x3 grid style view
- **US-2.2:** The system SHALL support filtering by: make, body type, fuel type, price range (min/max), and minimum safety rating.
- **US-2.3:** The system SHALL support sorting by: price (asc/desc), mileage (asc/desc), safety rating (desc), and user rating (desc).
- **US-2.4:** Filters SHALL be applied server-side and update results without a full page reload.

### US-3: Car Detail View
> *As a buyer, I want to see full details about a specific car so that I can evaluate it thoroughly.*

- **US-3.1:** The system SHALL display a detail page for each car showing all data model fields defined in Section 5.
- **US-3.2:** The detail page SHALL include a "Add to Shortlist" action button.
- **US-3.3:** The detail page SHALL display user reviews with rating and review text.

### US-4: Compare Cars
> *As a buyer narrowing down options, I want to compare 2–3 cars side-by-side so that I can see trade-offs clearly.*

- **US-4.1:** The system SHALL allow the user to select 2–3 cars for comparison. Max - 3 cars at a time for UX purposes.
- **US-4.2:** The comparison view SHALL render a table with cars as columns and attributes as rows.
- **US-4.3:** The comparison SHALL highlight the best value in each row (e.g., lowest price, highest safety rating).
- **US-4.4** The view SHALL have a badge system for the priority of the best value of the car in that specific row.
- **US-4.5:** *(SHOULD HAVE)* The comparison page SHALL display a **radar chart** visualizing how each car scores across key dimensions: Price (inverted — lower is better), Mileage, Horsepower, Safety Rating, and User Rating. Each car SHALL be a distinct colored polygon overlay. The chart SHALL use a lightweight charting library (Recharts).

### US-5: Shortlist
> *As a buyer, I want to save cars to a shortlist so that I can revisit my top picks later.*

- **US-5.1:** The system SHALL allow adding/removing cars to/from a shortlist.
- **US-5.2:** The shortlist SHALL persist in browser local storage (no auth required for MVP).
- **US-5.3:** The shortlist page SHALL display all saved cars and allow removing or comparing them.

---

## 4. Deliberate Cuts (Out of Scope for MVP)

- User authentication / accounts
- Real-time pricing or external API integrations
- Image uploads (placeholder images used)
- Admin panel for managing cars
- Mobile-native apps
- AI/LLM-powered natural language search (keep it deterministic)
- Dealer contact / lead generation

---

## 5. Data Model — Car Schema

The database SHALL store car records with the following fields:

```
Car {
  id              : string (UUID)        — Primary key
  make            : string               — Manufacturer (e.g., "Toyota")
  model           : string               — Model name (e.g., "Camry")
  variant         : string               — Trim/variant (e.g., "XLE V6")
  year            : integer              — Model year (2020–2026)
  price           : integer              — MSRP in USD (no cents)
  bodyType        : enum                 — "sedan" | "suv" | "hatchback" | "truck" | "coupe" | "minivan"
  fuelType        : enum                 — "petrol" | "diesel" | "electric" | "hybrid"
  transmission    : enum                 — "automatic" | "manual"
  engineCapacityCC: integer | null       — Engine displacement in CC (null for EVs)
  horsePower      : integer              — Horsepower
  mileage         : float                — Fuel economy in km/l (or km/kWh for EVs)
  seatingCapacity : integer              — Number of seats (2, 4, 5, 7, 8)
  safetyRating    : float                — NCAP-style rating, 1.0–5.0
  userRating      : float                — Average user rating, 1.0–5.0
  reviewCount     : integer              — Number of user reviews
  features        : string[]             — List of notable features (e.g., ["sunroof", "ABS", "lane assist"])
  pros            : string[]             — Top 3 pros from reviews
  cons            : string[]             — Top 3 cons from reviews
  imageUrl        : string               — Placeholder image URL
  createdAt       : datetime             — Record creation timestamp
}
```

### 5.1 Review Sub-Schema

```
Review {
  id        : string (UUID)
  carId     : string (FK → Car.id)
  author    : string               — Reviewer display name
  rating    : float                — 1.0–5.0
  title     : string               — One-line summary
  body      : string               — Review text (max 500 chars)
  createdAt : datetime
}
```

---

## 6. Seed Data Specification

- The system SHALL seed the database with **80 cars** across at least **15 distinct makes**.
- Makes SHALL include a realistic mix: Toyota, Honda, Hyundai, Kia, Mazda, Ford, Chevrolet, BMW, Mercedes-Benz, Audi, Tesla, Volkswagen, Subaru, Nissan, Jeep.
- Body type distribution SHALL be approximately: 30% SUV, 25% Sedan, 15% Hatchback, 10% Truck, 10% Coupe, 10% Minivan.
- Fuel type distribution SHALL include at least 10 EVs and 10 hybrids.
- Price range SHALL span from $18,000 to $85,000.
- Each car SHALL have 1–3 seeded reviews.
- Seed data SHALL be loaded automatically on first server start (idempotent — no duplicates on restart).
- Seed data SHALL be stored as a JSON file (`seed/cars.json`) for easy inspection and modification.

---

## 7. API Contract

**Base URL:** `/api`

All responses SHALL use JSON. Errors SHALL return `{ "error": "<message>" }` with appropriate HTTP status codes.

### 7.1 List Cars

```
GET /api/cars
```

**Query Parameters:**

| Param          | Type    | Required | Description |
|----------------|---------|----------|-------------|
| page           | int     | No       | Page number (default: 1) |
| limit          | int     | No       | Items per page (default: 12, max: 50) |
| make           | string  | No       | Filter by make (exact match) |
| bodyType       | string  | No       | Filter by body type |
| fuelType       | string  | No       | Filter by fuel type |
| minPrice       | int     | No       | Minimum price |
| maxPrice       | int     | No       | Maximum price |
| minSafetyRating| float   | No       | Minimum safety rating |
| sortBy         | string  | No       | Field to sort by: "price", "mileage", "safetyRating", "userRating" |
| sortOrder      | string  | No       | "asc" or "desc" (default: "asc") |

**Response (200):**

```json
{
  "data": [ Car[] ],
  "pagination": {
    "page": 1,
    "limit": 12,
    "total": 80,
    "totalPages": 7
  }
}
```

### 7.2 Get Car by ID

```
GET /api/cars/:id
```

**Response (200):** Full `Car` object with embedded `reviews: Review[]`.

**Response (404):** `{ "error": "Car not found" }`

### 7.3 Get Recommendations (Quiz)

```
POST /api/recommendations
```

**Request Body:**

```json
{
  "budget": 35000,              // User-entered dollar amount
  "budgetMode": "flexible",     // "strict" | "flexible"
  "useCase": "city",            // "city" | "highway" | "offroad" | "family"
  "fuelPreference": "hybrid",   // "petrol" | "diesel" | "electric" | "hybrid" | "no_preference"
  "seatingNeed": 5,             // 2 | 4 | 5 | 7 | 8
  "topPriority": "mileage"      // "safety" | "mileage" | "performance" | "value"
}
```

**Budget Resolution (server-side):**

- If `budgetMode` = `"strict"`: effective range = `[0, budget]`. Cars above `budget` SHALL be excluded entirely.
- If `budgetMode` = `"flexible"`: effective range = `[0, budget + 3000]`. Cars priced between `budget` and `budget + 3000` SHALL be included but tagged `"graceWindow": true`. Cars below `budget - 3000` are also valid (no lower penalty — cheaper is fine).
- The grace amount (`$3,000`) SHALL be a named server-side constant `BUDGET_GRACE_AMOUNT` for easy tuning.

**Scoring Algorithm — TOPSIS (backend computation):**

The backend SHALL rank cars using the **TOPSIS** (Technique for Order of Preference by Similarity to Ideal Solution) method:

1. **Build the decision matrix** — rows = candidate cars (filtered by effective budget range), columns = criteria:
   | Criterion       | Weight | Direction | Derivation |
   |-----------------|--------|-----------|------------|
   | Budget fit      | 0.25   | Benefit   | `1 - abs(car.price - budget) / budget` clamped [0,1] |
   | Use-case fit    | 0.20   | Benefit   | 1.0 if bodyType matches use-case map, 0.5 partial, 0.0 miss |
   | Fuel match      | 0.15   | Benefit   | 1.0 exact, 0.5 no_preference, 0.0 miss |
   | Seating match   | 0.10   | Benefit   | 1.0 exact, 0.5 if ±1, 0.0 otherwise |
   | Priority attr   | 0.15   | Benefit   | Normalized value of the chosen priority attribute (0–1) |
   | Safety rating   | 0.10   | Benefit   | `safetyRating / 5.0` |
   | User rating     | 0.05   | Benefit   | `userRating / 5.0` |

2. **Normalize** — vector-normalize each column: $r_{ij} = \frac{x_{ij}}{\sqrt{\sum_i x_{ij}^2}}$

3. **Weight** — multiply each normalized value by its weight: $v_{ij} = w_j \cdot r_{ij}$

4. **Ideal Best ($A^+$)** — for each criterion, take the maximum weighted value across all candidate cars.

5. **Ideal Worst ($A^-$)** — for each criterion, take the minimum weighted value across all candidate cars.

6. **Euclidean distances:**
   - $D_i^+ = \sqrt{\sum_j (v_{ij} - A_j^+)^2}$ — distance from ideal best
   - $D_i^- = \sqrt{\sum_j (v_{ij} - A_j^-)^2}$ — distance from ideal worst

7. **Closeness coefficient:** $C_i = \frac{D_i^-}{D_i^+ + D_i^-}$ — value in [0, 1]; higher = better match.

8. **Rank** by $C_i$ descending. Return top 10.

**Use-case → body type mapping:**

| Use Case  | Best-fit body types              |
|-----------|----------------------------------|
| city      | hatchback, sedan                 |
| highway   | sedan, coupe                     |
| offroad   | suv, truck                       |
| family    | suv, minivan                     |

**Response (200):**

```json
{
  "data": [
    {
      "car": Car,
      "score": 87,
      "closenessCoefficient": 0.87,
      "graceWindow": false,
      "overBudgetBy": 0,
      "matchReasons": ["Within budget", "Great mileage", "Seats 5"]
    }
  ]
}
```

The response SHALL return the top 10 cars sorted by closeness coefficient descending.

**Match Reasons generation:**

The backend SHALL generate `matchReasons` by inspecting each car's per-criterion raw scores (pre-normalization) and selecting the top 2–3 criteria where the car scored ≥ 0.75. Reason labels:

| Criterion     | Reason text when score ≥ 0.75 |
|---------------|-------------------------------|
| Budget fit    | "Within your budget" or "Slight stretch — $X over" |
| Use-case fit  | "Great for {useCase} driving" |
| Fuel match    | "Matches your fuel preference" |
| Seating match | "Seats {n} — just right" |
| Priority attr | "Top-tier {priority}" |
| Safety rating | "Excellent safety rating" |
| User rating   | "Highly rated by owners" |

### 7.4 Compare Cars

```
GET /api/cars/compare?ids=uuid1,uuid2,uuid3
```

**Query Parameters:**

| Param | Type   | Required | Description |
|-------|--------|----------|-------------|
| ids   | string | Yes      | Comma-separated car UUIDs (2–3 required) |

**Response (200):**

```json
{
  "data": Car[],
  "highlights": {
    "lowestPrice": "uuid1",
    "bestMileage": "uuid2",
    "highestSafety": "uuid3",
    "bestUserRating": "uuid1"
  },
  "radarData": [
    {
      "dimension": "Price",
      "uuid1": 0.82,
      "uuid2": 0.75,
      "uuid3": 0.90
    }
  ]
}
```

The `radarData` array SHALL contain one entry per dimension (Price, Mileage, Horsepower, Safety, User Rating) with each car's normalized score (0–1). Price SHALL be inverted so that lower price = higher score.

**Response (400):** `{ "error": "Provide 2 or 3 car IDs" }`

### 7.5 Get Filter Options (Aggregation)

```
GET /api/cars/filters
```

**Response (200):**

```json
{
  "makes": ["Audi", "BMW", ...],
  "bodyTypes": ["sedan", "suv", ...],
  "fuelTypes": ["petrol", "electric", ...],
  "priceRange": { "min": 18000, "max": 85000 },
  "years": [2020, 2021, ..., 2026]
}
```

---

## 8. Tech Stack

| Layer      | Choice        | Rationale |
|------------|---------------|-----------|
| Frontend   | React 18 (Vite) | Lightweight, fast HMR, no SSR overhead for an MVP |
| Styling    | Tailwind CSS  | Rapid UI development, no custom CSS overhead |
| Routing    | React Router v6 | Client-side SPA routing, simple and well-known |
| Backend    | Express.js (Node) | Minimal, flexible, easy to wire up REST endpoints |
| Database   | SQLite (via better-sqlite3) | Zero-config, file-based, perfect for MVP — no external DB needed |
| DB Access  | Raw SQL via better-sqlite3 | No ORM overhead; direct, readable queries; full control |
| Charts     | Recharts          | Lightweight React charting lib for radar chart (SHOULD HAVE) |
| Linting    | ESLint + Prettier | Consistent code style across frontend and backend |
| Monorepo   | npm workspaces | Single `npm run dev` boots both client and server |
| Deployment | Local `npm run dev` or Docker | Single-command, meets HC-1 |

---

## 9. UI Wireframe Descriptions

### 9.1 Landing / Home Page

```
┌──────────────────────────────────────────────────┐
│  HEADER: Logo ("CarFinder") | Nav: [Browse] [Shortlist (n)] │
├──────────────────────────────────────────────────┤
│                                                  │
│   HERO SECTION                                   │
│   "Not sure which car to buy?"                   │
│   "Take our 60-second quiz and get personalized  │
│    recommendations."                             │
│   [ Start Quiz → ]  (primary CTA)               │
│   [ Or browse all cars → ] (secondary link)      │
│                                                  │
├──────────────────────────────────────────────────┤
│  FEATURED SECTION: "Popular Picks"               │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐            │
│  │ Card │ │ Card │ │ Card │ │ Card │            │
│  │ img  │ │ img  │ │ img  │ │ img  │            │
│  │ Make │ │ Make │ │ Make │ │ Make │            │
│  │ $$$  │ │ $$$  │ │ $$$  │ │ $$$  │            │
│  │ ★4.5 │ │ ★4.2 │ │ ★4.8 │ │ ★4.1 │            │
│  └──────┘ └──────┘ └──────┘ └──────┘            │
└──────────────────────────────────────────────────┘
```

- The landing page SHALL have a prominent CTA to start the quiz.
- The landing page SHALL display 4 top-rated cars as "Popular Picks".

### 9.2 Quiz Flow

**Step 1 — Budget (free-form input):**

```
┌──────────────────────────────────────────────────┐
│  Progress Bar: ██░░░░░░░░  Step 1 of 5           │
├──────────────────────────────────────────────────┤
│                                                  │
│  "What's your budget?"                           │
│                                                  │
│  $ [___________]  (numeric input field)          │
│                                                  │
│  Budget mode:                                    │
│  (●) Flexible — show me options ±$3K of my       │
│      budget for the best match                   │
│  ( ) Strict — only show cars within my budget    │
│                                                  │
│                           [ Next → ]             │
└──────────────────────────────────────────────────┘
```

**Steps 2–5 — Option cards (use case, fuel, seating, priority):**

```
┌──────────────────────────────────────────────────┐
│  Progress Bar: ██████░░░░  Step 3 of 5           │
├──────────────────────────────────────────────────┤
│                                                  │
│  "What will you mainly use the car for?"         │
│                                                  │
│  ┌─────────────┐  ┌─────────────┐                │
│  │ 🏙️ City    │  │ 🛣️ Highway │                │
│  └─────────────┘  └─────────────┘                │
│  ┌─────────────┐  ┌─────────────┐                │
│  │ 🏔️ Offroad │  │ 👨‍👩‍👧‍👦 Family│                │
│  └─────────────┘  └─────────────┘                │
│                                                  │
│  [ ← Back ]                [ Next → ]            │
└──────────────────────────────────────────────────┘
```

- The quiz SHALL show a progress bar indicating current step out of total.
- Step 1 (Budget) SHALL use a numeric input field with a dollar prefix — NOT pre-set brackets.
- Step 1 SHALL include a radio toggle for Strict vs. Flexible budget mode (default: Flexible).
- Steps 2–5 SHALL present clickable option cards (not dropdowns).
- Navigation SHALL allow going back to previous questions.
- On final step, a "Get My Recommendations" button SHALL submit to the API.

### 9.3 Recommendations Results Page

```
┌──────────────────────────────────────────────────────────────┐
│  "Your Top Matches"                                         │
├────────────────────┬─────────────────────────────────────────┤
│ ADJUST PREFERENCES │  RESULTS LIST                           │
│ ┌────────────────┐ │                                         │
│ │ Budget: $35,000│ │  ┌─────────────────────────────────────┐│
│ │ Mode: Flexible │ │  │ #1  92% Match                       ││
│ │ Use: City      │ │  │ Toyota Camry XLE — $28,500          ││
│ │ Fuel: Hybrid   │ │  │ Sedan · Hybrid · 22 km/l · ★4.5    ││
│ │ Seats: 5       │ │  │ WHY: ✓ Within your budget           ││
│ │ Priority: MPG  │ │  │      ✓ Great for city driving       ││
│ │                │ │  │      ✓ Top-tier mileage              ││
│ │ [ Re-run ↻ ]   │ │  │ [ View Details ]  [ + Shortlist ]   ││
│ └────────────────┘ │  └─────────────────────────────────────┘│
│                    │  ┌─────────────────────────────────────┐│
│                    │  │ #2  87% Match  ⚡ Stretch Pick +$2K ││
│                    │  │ ...                                 ││
│                    │  └─────────────────────────────────────┘│
└────────────────────┴─────────────────────────────────────────┘
```

- Each result card SHALL display the closeness coefficient as a percentage match score.
- Each card SHALL list 2–3 **match reasons** (the "WHY") explaining why the car was recommended, derived from TOPSIS criteria scores.
- Grace-window cars SHALL show a "Stretch Pick +$X" badge.
- The left sidebar SHALL display the user's current quiz answers in editable form.
- The user SHALL be able to modify any preference and click "Re-run" to get updated recommendations without re-entering the full quiz.
- Cards SHALL have actions to view details or add to shortlist.

### 9.4 Browse / Catalog Page

```
┌──────────────────────────────────────────────────┐
│  FILTERS SIDEBAR        │  RESULTS GRID          │
│  ┌───────────────────┐  │  Sort: [Price ▼]       │
│  │ Make: [Dropdown]  │  │  Showing 1–12 of 80    │
│  │ Body: [Chips]     │  │                        │
│  │ Fuel: [Chips]     │  │  ┌──────┐ ┌──────┐    │
│  │ Price: [Slider]   │  │  │ Card │ │ Card │    │
│  │ Safety: [≥ 4★]    │  │  └──────┘ └──────┘    │
│  │                   │  │  ┌──────┐ ┌──────┐    │
│  │ [ Clear Filters ] │  │  │ Card │ │ Card │    │
│  └───────────────────┘  │  └──────┘ └──────┘    │
│                         │  [ 1 ] [2] [3] ... [7] │
└──────────────────────────────────────────────────┘
```

- The sidebar SHALL contain all filter controls defined in US-2.2.
- The filter panel SHALL show active filter count.
- Results SHALL update dynamically as filters change.

### 9.5 Car Detail Page

```
┌──────────────────────────────────────────────────┐
│  ← Back to results                               │
├──────────────────────────────────────────────────┤
│  ┌──────────────┐  Toyota Camry XLE 2024         │
│  │              │  $28,500  ·  Sedan  ·  Hybrid  │
│  │   [Image]    │  ★ 4.5 safety  ·  ★ 4.3 users │
│  │              │  [ + Add to Shortlist ]         │
│  └──────────────┘  [ Compare ]                   │
├──────────────────────────────────────────────────┤
│  SPECS TABLE                                     │
│  Engine: 2.5L  |  HP: 208  |  Trans: Auto        │
│  Mileage: 22 km/l  |  Seats: 5                   │
│  Features: Sunroof, ABS, Lane Assist, ...        │
├──────────────────────────────────────────────────┤
│  PROS & CONS                                     │
│  ✓ Excellent fuel economy    ✗ No AWD option     │
│  ✓ Spacious rear seats       ✗ Plain interior    │
├──────────────────────────────────────────────────┤
│  REVIEWS (3)                                     │
│  ★★★★☆ "Great daily driver" — John D.            │
│  "Bought this for my commute and love it..."     │
└──────────────────────────────────────────────────┘
```

- The detail page SHALL show all Car schema fields in an organized layout.
- Pros and cons SHALL be displayed in a two-column layout.
- Reviews SHALL be listed below specs.

### 9.6 Comparison Page

```
┌──────────────────────────────────────────────────┐
│  Compare Cars (3)                                │
├──────────────────────────────────────────────────┤
│              │ Camry XLE   │ Civic EX   │ Mazda3 │
│──────────────┼─────────────┼────────────┼────────│
│ Price        │ $28,500     │ ★$26,200   │$27,800 │
│ Body         │ Sedan       │ Sedan      │ Hatch  │
│ Fuel         │ Hybrid      │ Petrol     │ Petrol │
│ Mileage      │ ★22 km/l   │ 18 km/l    │ 19 km/l│
│ HP           │ 208         │ 180        │ ★191   │
│ Safety       │ ★4.5        │ 4.3        │ 4.4    │
│ User Rating  │ 4.3         │ ★4.5       │ 4.2    │
│ Seats        │ 5           │ 5          │ 5      │
├──────────────┼─────────────┼────────────┼────────│
│              │ [Details]   │ [Details]  │[Details]│
│              │ [Remove]    │ [Remove]   │[Remove] │
├──────────────────────────────────────────────────┤
│  RADAR CHART (SHOULD HAVE)                       │
│                                                  │
│           Price                                  │
│            ╱╲                                    │
│      User /  \ Mileage                           │
│      Rating\  /                                  │
│            ╲╱                                    │
│     Safety   HP                                  │
│                                                  │
│  ── Camry   ── Civic   ── Mazda3                 │
└──────────────────────────────────────────────────┘
```

- Best value per row SHALL be marked with a ★ or highlighted.
- Each column SHALL have a link to the full detail page.
- *(SHOULD HAVE)* A radar chart SHALL be rendered below the table showing each car as a colored polygon across 5 dimensions: Price (inverted), Mileage, HP, Safety Rating, User Rating.

### 9.7 Shortlist Page

```
┌──────────────────────────────────────────────────┐
│  My Shortlist (3 cars)     [ Compare Selected ]  │
├──────────────────────────────────────────────────┤
│  ☐ Toyota Camry XLE — $28,500 — ★4.5  [Remove]  │
│  ☐ Honda Civic EX — $26,200 — ★4.3    [Remove]  │
│  ☐ Mazda 3 Turbo — $27,800 — ★4.4     [Remove]  │
├──────────────────────────────────────────────────┤
│  "You're confident about your picks!"            │
│  (shown when ≥ 2 cars in shortlist)              │
└──────────────────────────────────────────────────┘
```

- The shortlist SHALL allow selecting cars via checkboxes for comparison.
- The "Compare Selected" button SHALL be enabled only when 2–3 cars are selected.

---

## 10. Non-Functional Requirements

- **NFR-1:** The app SHALL load initial page in under 2 seconds on a standard connection.
- **NFR-2:** API responses SHALL return within 500ms for all endpoints. Use batching, multi-threading wherver needed to reduce the response time.
- **NFR-3:** The UI SHALL be responsive and usable across devices - based on dynamic screen size fetching.
- **NFR-4:** The app SHALL have no runtime console errors during normal usage.
- **NFR-5:** All API inputs SHALL be validated server-side; invalid requests SHALL return 400 with a descriptive error message.

---

## 11. Project Structure (Target)

```
/
├── client/                        — React (Vite) frontend
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── src/
│   │   ├── main.jsx               — App entry point
│   │   ├── App.jsx                — Router setup
│   │   ├── pages/
│   │   │   ├── Home.jsx           — Landing / Hero
│   │   │   ├── Quiz.jsx           — Multi-step quiz
│   │   │   ├── Results.jsx        — TOPSIS recommendation results
│   │   │   ├── Browse.jsx         — Catalog with filters
│   │   │   ├── CarDetail.jsx      — Single car detail view
│   │   │   ├── Compare.jsx        — Side-by-side comparison
│   │   │   └── Shortlist.jsx      — Saved cars list
│   │   ├── components/            — Shared UI components
│   │   ├── hooks/                 — Custom React hooks
│   │   ├── lib/
│   │   │   └── api.js             — Fetch wrapper for backend calls
│   │   └── index.css              — Tailwind directives
│   └── package.json
├── server/                        — Express backend
│   ├── index.js                   — Express app entry
│   ├── db/
│   │   ├── connection.js          — better-sqlite3 init + migrations
│   │   ├── schema.sql             — CREATE TABLE statements
│   │   └── seed.js                — Seed script (reads cars.json)
│   ├── routes/
│   │   ├── cars.js                — /api/cars, /api/cars/:id, /api/cars/compare, /api/cars/filters
│   │   └── recommendations.js     — /api/recommendations (TOPSIS engine)
│   ├── services/
│   │   └── topsis.js              — TOPSIS scoring algorithm
│   ├── middleware/
│   │   └── validate.js            — Input validation middleware
│   └── package.json
├── seed/
│   └── cars.json                  — Static seed data (80 cars + reviews)
├── .eslintrc.json
├── .prettierrc
├── package.json                   — Root workspace config (npm workspaces)
└── README.md
```

---

## 12. Seed Data Generation Rules

- Seed data SHALL be a static JSON file (`seed/cars.json`) — not fetched from external APIs at runtime.
- Each car entry SHALL have realistic, internally consistent data (e.g., EVs have `engineCapacityCC: null`, trucks have higher horsepower).
- Price SHALL correlate logically with make (luxury brands higher).
- Each car SHALL have 1–3 reviews with distinct author names, realistic titles, and body text.
- `userRating` SHALL equal the average of its associated review ratings.
- The seed script SHALL be idempotent: running it multiple times SHALL NOT create duplicate records.
- The seed script SHALL run automatically on server start via `server/db/seed.js` which reads `seed/cars.json` and inserts into SQLite using better-sqlite3.
- The seed script SHALL check `SELECT COUNT(*) FROM cars`; if > 0, it SHALL skip insertion.

---

## 13. Acceptance Criteria Summary

| ID | Criterion | Verification |
|----|-----------|-------------|
| AC-1 | `npm run dev` starts the full app | Manual — run command, app loads in browser |
| AC-2 | 80 cars visible in browse page | Browse page shows pagination with ~7 pages |
| AC-3 | Quiz completes and returns TOPSIS-ranked results | Submit quiz, verify scored results with closeness coefficients appear |
| AC-4 | Filters narrow results correctly | Apply price filter, confirm result count changes |
| AC-5 | Car detail page shows all fields | Click a car, verify all schema fields present |
| AC-6 | Compare page highlights best values | Select 2–3 cars, compare, verify highlights |
| AC-7 | Shortlist persists across page navigation | Add car, navigate away, return — car still there |
| AC-8 | API returns 400 on invalid compare request | Call `/api/cars/compare?ids=one_id` — get error |
| AC-9 | Seed is idempotent | Run seed twice, verify still 80 cars |
| AC-10 | Flexible budget shows grace-window cars tagged | Set budget $30K flexible, verify cars $30K–$33K show "Stretch Pick" tag |
| AC-11 | Strict budget excludes over-budget cars | Set budget $30K strict, verify no cars above $30K appear |
| AC-12 | Each recommendation shows WHY reasons | Submit quiz, verify each result card displays 2–3 match reason labels |
| AC-13 | Adjust preferences re-runs without full quiz | On results page, change budget in sidebar, click Re-run, verify results update |
| AC-14 | *(SHOULD)* Radar chart renders on compare page | Compare 2–3 cars, verify radar chart with colored polygons appears |
