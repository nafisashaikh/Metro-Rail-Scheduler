# Metro Rail Scheduler — Backend

REST API for the Mumbai Metro & Maharashtra Railway Scheduler frontend.

## Stack

- **Runtime**: Node.js 22+ (uses built-in `node:sqlite`)
- **Framework**: Express 4 with TypeScript
- **Database**: SQLite (via Node.js built-in `node:sqlite`)
- **Auth**: JSON Web Tokens (JWT) + bcrypt
- **Validation**: Zod

## Getting Started

### 1. Install dependencies

```bash
cd backend
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
# Edit .env and set a strong JWT_SECRET
```

### 3. Seed the database

```bash
npm run seed
```

This creates `metro.db` and populates it with:
- 3 staff users (admin, supervisor, employee)
- 2 passenger accounts
- All 9 metro/railway lines with stations
- 7 seed alerts

### 4. Start the development server

```bash
npm run dev
```

The API runs on `http://localhost:3000` by default.

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | Server port |
| `JWT_SECRET` | `dev-secret-…` | **Must change in production** |
| `JWT_EXPIRES_IN` | `24h` | JWT expiry |
| `DB_PATH` | `./metro.db` | SQLite database path |
| `NODE_ENV` | `development` | Environment |
| `CORS_ORIGIN` | `*` | Allowed CORS origin(s) |

## API Reference

### Authentication

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/auth/staff/login` | Staff login → `{ token, user }` |
| `POST` | `/api/auth/passenger/login` | Passenger login → `{ token, user }` |
| `GET` | `/api/auth/me` | Current user (requires `Authorization: Bearer <token>`) |

**Staff login body:**
```json
{ "employeeId": "MRS-A-001", "password": "admin123" }
```

**Passenger login body:**
```json
{ "username": "user001", "password": "pass123" }
```

### Lines

| Method | Path | Query Params | Description |
|--------|------|-------------|-------------|
| `GET` | `/api/lines` | `section=metro\|railway` | List all lines |
| `GET` | `/api/lines/:id` | — | Get single line with stations |
| `GET` | `/api/lines/:id/stations` | — | Get station coordinates for a line |

### Trains (dynamically generated)

| Method | Path | Query Params | Description |
|--------|------|-------------|-------------|
| `GET` | `/api/trains` | `station`, `lineId` (**required**) | Get trains for station |
| `GET` | `/api/trains/:id` | `station`, `lineId` | Get single train |
| `GET` | `/api/trains/:id/health` | `station`, `lineId` | Train health metrics |
| `GET` | `/api/trains/:id/capacity` | `station`, `lineId` | Train capacity |
| `GET` | `/api/trains/:id/predict` | `station`, `lineId` | Predicted arrival |

### Stations

| Method | Path | Query Params | Description |
|--------|------|-------------|-------------|
| `GET` | `/api/stations` | `section=metro\|railway` | List all stations |
| `GET` | `/api/stations/:name/metrics` | `section=metro\|railway` | Station efficiency metrics |

### Schedules

| Method | Path | Body / Query | Description |
|--------|------|-------------|-------------|
| `GET` | `/api/schedules` | `station`, `lineId` (**required**) | Departure schedule |
| `POST` | `/api/schedules/predict` | `{ trainId, station, lineId }` | Predict arrival time |

### Alerts

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/api/alerts` | — | List alerts (`?section=`, `?resolved=`) |
| `GET` | `/api/alerts/:id` | — | Get single alert |
| `POST` | `/api/alerts` | Staff only | Create new alert |
| `PATCH` | `/api/alerts/:id/resolve` | Staff only | Mark alert as resolved |
| `DELETE` | `/api/alerts/:id` | Admin only | Delete alert |

**Create alert body:**
```json
{
  "type": "medical|technical|security|weather|delay",
  "severity": "info|warning|critical",
  "title": "string",
  "message": "string",
  "station": "string",
  "section": "metro|railway",
  "nextStation": "string (optional)",
  "trainId": "string (optional)",
  "journeyContinued": true (optional)
}
```

### Weather

| Method | Path | Query Params | Description |
|--------|------|-------------|-------------|
| `GET` | `/api/weather` | `location=mumbai\|thane\|pune` or `section=metro\|railway` | Weather data |

### Journey Planner

| Method | Path | Query Params | Description |
|--------|------|-------------|-------------|
| `GET` | `/api/journey/plan` | `from`, `to`, `section=metro\|railway` | Plan a journey |

## Demo Credentials

### Staff

| Role | Employee ID | Password |
|------|------------|---------|
| Admin | `MRS-A-001` | `admin123` |
| Supervisor | `MRS-S-042` | `super123` |
| Employee | `MRS-E-187` | `emp123` |

### Passengers

| Username | Password | Card |
|----------|----------|------|
| `user001` | `pass123` | MPC-7842 |
| `user002` | `metro2024` | MPC-3391 |

## Connecting the Frontend

Set `VITE_API_BASE_URL` in the frontend's `.env`:

```env
VITE_API_BASE_URL=http://localhost:3000
```

The frontend includes an API service layer at `src/app/services/api.ts` that automatically uses the backend when this variable is set, and falls back to local mock data when it is not.

## Production Build

```bash
npm run build   # compiles TypeScript to dist/
npm start       # runs the compiled server
```
