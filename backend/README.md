# Metro Rail Scheduler Backend

Backend API for authentication and protected schedule access.

## Tech Stack

- Node.js + Express
- TypeScript
- JWT authentication
- Zod request validation

## Quick Start

1. Install dependencies:
   ```bash
   npm install
   ```
2. Create environment file:
   ```bash
   copy .env.example .env
   ```
3. Start development server:
   ```bash
   npm run dev
   ```

Default server: `http://localhost:4000`

## API

### Health

- `GET /health`
- Response: `{ "status": "ok", "service": "metro-rail-scheduler-backend" }`

### Login

- `POST /auth/login`
- Body:
  ```json
  {
    "role": "admin",
    "identifier": "MRS-A-001",
    "password": "admin123"
  }
  ```
- Returns: JWT token and sanitized user profile

### Passenger Signup

- `POST /auth/signup/passenger`
- Body:
   ```json
   {
      "name": "New Passenger",
      "username": "newuser123",
      "password": "pass9876"
   }
   ```
- Returns: JWT token and created passenger profile

### Protected Schedules

- `GET /schedules`
- Header: `Authorization: Bearer <token>`
- Returns: list of schedule items

### Current Session

- `GET /auth/me`
- Header: `Authorization: Bearer <token>`
- Returns: current authenticated user profile

## Notes

- Current data is in-memory for bootstrap development.
- Next step for production is adding a real database and refresh-token flow.
