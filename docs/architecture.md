# OctoFit Tracker architecture

OctoFit Tracker is a three-tier application for a school fitness program. The starter code includes API contracts and intentionally incomplete implementation points so you can use GitHub Copilot agent mode in a test-driven loop.

![Three-tier OctoFit architecture](../.github/images/octofit-architecture.svg)

## Tier boundaries

- **Presentation tier**: React 19, Vite, React Router, Bootstrap, and a shared API client in `octofit-tracker/frontend/src`.
- **Logic tier**: Express and TypeScript routes/services in `octofit-tracker/backend/src` expose `/api/*` behavior on port `8000`.
- **Data tier**: Mongoose models and seed data in `octofit-tracker/backend/src/models` and `src/scripts/seed.ts` persist to MongoDB on port `27017`.

## Ports and environment rules

- MongoDB: `27017`
- Express API: `8000`
- Vite frontend: `5173`
- The browser calls relative `/api` paths. Vite proxies them to `http://localhost:8000`, so the unauthenticated API port stays private in Codespaces. `VITE_API_BASE_URL` can override the base URL.

## API contract

| Capability | Method and path | Expected behavior |
| --- | --- | --- |
| Activity tracking | `GET /api/activities`, `POST /api/activities` | List and create valid activity records. POST accepts `userId`, `teamId`, `type`, and `minutes`; `userId` and `teamId` must be well-formed IDs for an existing user and team; otherwise respond with a deliberate 4xx (never a 500 from a cast error). A created activity stores the submitted `user`, `team`, `type`, and `minutes` plus computed `points` and `occurredAt`. |
| Teams | `GET /api/teams`, `POST /api/teams` | List and create teams with members. Created and listed teams keep the submitted `name` and `mascot`. Reject a team without a name with `400`. |
| Leaderboard | `GET /api/leaderboard` | Return teams ordered by the sum of their activity points, highest first. Each entry has `teamName`, `totalPoints`, and a 1-based `rank`. |
| Workout suggestions | `GET /api/workouts/suggestions/:userEmail` | Recommend workouts from recent activity patterns for the matching seeded user's email address. The first suggestion's `focus` matches that user's goal or recent activity, with a `reason` explaining why. An email with no matching user returns a deliberate 4xx (for example, `404`). |

## Implementation decisions

Record your plan here before editing code.

- Presentation tier decision: keep API requests and loading, success, empty, and error states in the React routes/components, using the shared API client and relative `/api` paths.
- Logic tier decision: keep route handlers thin and implement validation and persistence in the service layer. Return deliberate 4xx responses for invalid or unknown references instead of exposing cast errors or 500s.
- Data tier decision: make the Mongoose models enforce the required fields and relationships in the contracts. Preserve the seed script's non-destructive, idempotent behavior; its contract currently passes.
- Activity tracking approach: validate the submitted user and team IDs and confirm both records exist; persist the submitted activity fields with computed points and an occurrence date.
- Team management approach: reject a missing name and preserve submitted name, mascot, and members on create/list.
- Leaderboard approach: aggregate activity points by team, sort highest first, and assign 1-based ranks.
- Workout suggestions approach: find the requested user, use their goal or recent activity to choose the first suggestion, explain the match, and return a deliberate 4xx for an unknown email.

Implement and verify in dependency order: models and data contract, API service behavior and API contract, then presentation components and frontend contract. Finish with both tier build commands below.

## Test plan

Record the commands you run and what each failure means.

- Baseline (2026-10-28): `npm test --prefix octofit-tracker/backend -- --reporter=dot` reports 8 failures and 1 pass across the data and API contracts. Four failures are missing model validation (User, Team, Activity, Workout); four are incomplete activity creation, team creation, leaderboard, and workout suggestions. The seed idempotency test passes.
- Baseline (2026-10-28): `npm test --prefix octofit-tracker/frontend` reports 15 failures out of 15. The route components remain placeholders, so API data rendering, the user-specific workout request, and loading, empty, and API-error states are not implemented.
- Data-tier check: `npm run test:data --prefix octofit-tracker/backend`. Failures identify model constraints or seed behavior; retain the passing seed idempotency behavior.
- API check: `npm run test:api --prefix octofit-tracker/backend`. Failures identify request validation, persistence, ranking, or recommendation contract gaps.
- Frontend check: `npm test --prefix octofit-tracker/frontend`. Failures identify missing API integration or accessible loading, empty, success, and error UI.
- Backend build: `npm run build --prefix octofit-tracker/backend`.
- Frontend build: `npm run build --prefix octofit-tracker/frontend`.
