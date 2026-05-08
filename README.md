# CarFinder — Smart Car Recommendation Platform

## What I Built & Why

CarFinder helps confused car buyers go from "I don't know what to buy" to "I'm confident about my shortlist" — exactly what the brief asked for.

The core insight: most car buyers are overwhelmed by options. They don't need more listings — they need a decision framework. So I built a **guided quiz → ranked recommendations → compare → shortlist** flow that progressively narrows choices using real data.

**Key features shipped:**
- **5-step Quiz** with multi-select answers → TOPSIS-ranked recommendations with % match scores and human-readable "WHY" reasons
- **Browse & Filter** catalog (80 cars, server-side filtering/sorting/pagination) with explicit "Apply Filters" button to avoid unnecessary API load
- **Side-by-side Comparison** table with best-value highlights + radar chart (Recharts)
- **Persistent Shortlist** via React Context + localStorage (shared state across all components)
- **Adjust & Re-run** sidebar on results page — change preferences without restarting the quiz

**Product decisions:**
- Spec-first approach: wrote a full functional spec before code. This made AI delegation efficient — clear requirements = better output.
- Backend-first: got the data model + TOPSIS engine working and tested before touching UI.
- Multi-select quiz answers (not single-select) — real buyers have multiple use cases (e.g., "City + Family").
- Explicit "Apply/Re-run" buttons instead of auto-fetch on every filter change — scalable to 1M+ users without hammering the API.

## What I Deliberately Cut

- **User authentication** — no login/signup. Shortlist uses localStorage. Adding auth would have consumed time without adding decision-making value.
- **Real images** — placeholder URLs. Not the core problem being solved.
- **Admin panel** — no CRUD for cars. Read-only seeded dataset is sufficient for the demo.
- **Deployment** — local `npm run dev` only. The brief allows this and time was better spent on features.
- **Mobile-native** — responsive CSS handles smaller viewports, but no native app.
- **AI/LLM search** — kept it deterministic (TOPSIS). Reproducible results build user trust.

## Tech Stack & Why

| Layer | Choice | Why |
|-------|--------|-----|
| Frontend | React 19 + Vite | Fast HMR, lightweight, no SSR overhead for an MVP |
| Styling | Tailwind CSS v4 | Rapid UI — utility classes, no context-switching to CSS files |
| Charts | Recharts | Lightweight React-native charting for the radar comparison |
| Backend | Express.js | Minimal, flexible REST API — fast to wire up |
| Database | SQLite (better-sqlite3) | Zero-config, file-based, synchronous reads = fast. Perfect for MVP |
| Testing | Jest + Supertest | 25 endpoint tests covering all 6 API routes |
| Monorepo | npm workspaces | Single `npm run dev` boots both servers |

**Why not a heavier stack?** The problem is decision-support, not scale. SQLite handles 80 cars with sub-ms queries. Express is fast to build with. React + Tailwind let me ship a clean UI without ceremony.

## AI Tool Usage — What I Delegated vs. Did Manually

**Delegated to AI (GitHub Copilot):**
- Boilerplate scaffolding (Vite project, Express setup, route wiring)
- Seed data generation (80 realistic cars with specs, reviews, prices)
- Tailwind UI components (cards, forms, navigation)
- TOPSIS algorithm implementation (from the mathematical spec I wrote)
- Test case generation (25 endpoint tests)

**Done manually / directed:**
- Architecture decisions (layered DAO → Service → Controller pattern)
- Spec writing (the full functional spec that drove all implementation)
- Code review + course-correction (caught bugs: auto-refresh on filter change, shortlist state not syncing across components, JSX in .js file, array validation gap)
- Product scoping (what to build, what to cut, multi-select requirement)
- Performance decisions (explicit Apply button vs auto-fetch, Context vs independent hooks)

**Where AI helped most:**
- Seed data — generating 80 internally-consistent car records with reviews would have taken hours manually.
- UI components — Tailwind markup is verbose; AI generated it fast and I just reviewed styling.
- Boilerplate — Express routes, React Router setup, Vite config — zero-thought tasks done instantly.

**Where AI got in the way:**
- It initially used `useEffect` dependencies that auto-triggered API calls on every input change. I had to explicitly direct it to decouple draft state from applied state.
- It created `useShortlist` as isolated per-component state instead of shared Context — required a manual architecture correction.
- JSX in a `.js` file — AI didn't account for Vite's file-extension-based parser config.
- Backend validation didn't handle arrays initially despite frontend sending them — required explicit debugging.

## If I Had Another 4 Hours

1. **Role-based access control** — Separate logins for merchants (list cars), buyers (browse/quiz), and admins (dashboard to validate/approve listings before they go live on the platform).

2. **Scheduled data pipelines** — Cron-based daily DB updates to pull fresh pricing, availability, and review aggregations. Keep the catalog current without manual intervention.

3. **Visual vehicle search (AI-powered)** — Let users upload a photo of a car they spotted on the road. Use a vision model to identify make/model/year and surface matching listings. Solves the "I saw it but don't know what it is" problem.

4. **Semantic recommendation engine** — Move beyond criteria-based filtering. Store car attributes as vector embeddings, run cosine similarity (or a BERT-based hybrid approach) against user preference vectors. This enables "customers who liked X also liked Y" style recommendations — buyers stretch budgets when they find something that *feels* right. The current TOPSIS approach filters on explicit criteria; embeddings capture latent preferences that users can't articulate.

---

## Running Locally

```bash
# From repo root
npm install
npm run dev
```

This starts:
- Backend on `http://localhost:3001` (Express + SQLite, auto-seeds 80 cars)
- Frontend on `http://localhost:5173` (Vite + React, proxies `/api` to backend)

## Running Tests

```bash
cd backend
npm test
```

25 tests covering: health check, car listing/filtering/sorting/pagination, filters aggregation, car detail, comparison (2-3 cars + error cases), and recommendations (flexible/strict/validation/empty).

---

## Project Structure

```
├── backend/
│   ├── index.js              — Express entry point
│   ├── dao/                  — Data access (SQL queries)
│   ├── services/             — Business logic (TOPSIS, compare, recommendations)
│   ├── routes/               — Thin controllers
│   ├── middleware/           — Validation
│   ├── utils/                — Formatters, parsers, constants
│   ├── db/                   — SQLite connection + schema + seed
│   └── tests/                — Jest + Supertest (25 tests)
├── frontend/
│   ├── src/
│   │   ├── pages/            — 7 pages (Home, Quiz, Results, Browse, CarDetail, Compare, Shortlist)
│   │   ├── components/       — Shared UI (Navbar, CarCard, ProgressBar, Spinner)
│   │   ├── hooks/            — useShortlist (Context-based shared state)
│   │   └── lib/              — API client
│   └── vite.config.js
├── docs/
│   ├── spec.md               — Full functional specification
│   └── Assignment.txt        — Original brief
└── package.json              — npm workspaces root
```
