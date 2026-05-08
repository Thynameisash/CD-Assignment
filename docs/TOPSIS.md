# TOPSIS Algorithm — Multi-Criteria Decision Analysis

## What is TOPSIS?

**TOPSIS** (Technique for Order of Preference by Similarity to Ideal Solution) is a multi-criteria decision analysis method. It ranks alternatives by measuring their geometric distance from the best possible solution and the worst possible solution simultaneously.

The core idea: the best option is the one closest to the ideal best and farthest from the ideal worst.

## Why TOPSIS for Car Recommendations?

Car buying is inherently a multi-criteria problem — budget, use case, fuel preference, seating, safety, mileage, and performance all matter, but with different weights for different buyers. TOPSIS handles this naturally:

- It ranks across **7 weighted criteria** simultaneously
- It produces a **closeness coefficient** (0–1) that translates directly to a "% match" score
- It's **deterministic** — same inputs always produce same rankings (builds user trust)
- It handles **conflicting criteria** gracefully (e.g., "cheap but powerful")

## How It Works in CarFinder

### Step 1: Build the Decision Matrix

Each candidate car is scored across 7 criteria based on user preferences:

| Criterion | Weight | How It's Scored |
|-----------|--------|-----------------|
| Budget Fit | 0.25 | `1 - |price - budget| / budget` (closer to budget = better) |
| Use-Case Fit | 0.20 | 1.0 if body type matches use case(s), 0.0 otherwise |
| Fuel Match | 0.15 | 1.0 if fuel type matches preference(s), 0.0 miss |
| Seating Match | 0.10 | 1.0 exact, 0.5 if ±1 seat, 0.0 otherwise |
| Priority Attribute | 0.15 | Normalized value of chosen priority (safety/mileage/performance/value) |
| Safety Rating | 0.10 | `safetyRating / 5.0` |
| User Rating | 0.05 | `userRating / 5.0` |

### Step 2: Vector Normalization

Each column is normalized so that criteria with different scales become comparable:

$$r_{ij} = \frac{x_{ij}}{\sqrt{\sum_i x_{ij}^2}}$$

### Step 3: Apply Weights

Each normalized score is multiplied by its criterion weight:

$$v_{ij} = w_j \cdot r_{ij}$$

### Step 4: Determine Ideal Solutions

- **Ideal Best** ($A^+$): Maximum weighted value in each criterion across all candidates
- **Ideal Worst** ($A^-$): Minimum weighted value in each criterion across all candidates

### Step 5: Calculate Distances

Euclidean distance from each car to the ideal best and ideal worst:

$$D_i^+ = \sqrt{\sum_j (v_{ij} - A_j^+)^2}$$

$$D_i^- = \sqrt{\sum_j (v_{ij} - A_j^-)^2}$$

### Step 6: Closeness Coefficient

$$C_i = \frac{D_i^-}{D_i^+ + D_i^-}$$

Value in [0, 1] — higher means better match. This becomes the "92% match" score shown to users.

### Step 7: Rank & Return Top 10

Cars are sorted by closeness coefficient descending. Top 10 are returned with match reasons derived from which criteria each car scored highest on (≥ 0.75 threshold).

## Multi-Select Enhancement

The algorithm supports **multiple selections per criterion** (e.g., user selects both "City" and "Family" for use case):

- **Use Case**: Union of body type mappings (city → hatchback/sedan, family → SUV/minivan → combined set)
- **Fuel**: Any match across selected preferences = 1.0
- **Seating**: Best match across selected seat counts
- **Priority**: Max score across selected priorities

This prevents forcing users into single-choice answers when their real needs span multiple categories.

## Implementation

- **File**: `backend/services/topsis.js`
- **Pure function**: `rankCars(candidates, prefs)` — no side effects, no DB access
- **Separation of concerns**: TOPSIS only ranks. Match reasons, formatting, and grace-window logic live in separate modules.
