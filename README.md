# Metro Rail Scheduler

Mumbai Metro & Maharashtra Railway integrated rail operations and passenger information system.

## Overview

This project is a comprehensive web-based platform tailored for Metro Rail staff and passengers. It features real-time visualization, scheduling, interactive interfaces, routing, and passenger information management capabilities.

The original project design is available at [Figma Design](https://www.figma.com/design/w9RyQLWTgIeTyPU6ed7TxT/Metro-Rail-Scheduler).

## Technologies Used

- **Framework**: React 18 with Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Material-UI (MUI), Radix UI
- **Maps**: Leaflet (`react-leaflet` compatible)
- **Animations**: Framer Motion
- **Icons**: Lucide React, MUI Icons

## Getting Started

### Prerequisites

Ensure you have Node.js and `npm` (or `pnpm`/`yarn`) installed on your system.

### Installation

1. Clone the repository (if you haven't already):
   ```bash
   git clone <repository-url>
   cd metro-rail-scheduler
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Running the Application

To start the development server, run:
```bash
npm run dev
```

Open `http://localhost:5173` (or the port specified in your terminal) in your browser to view the application.

## Backend API (New)

This repository now includes a backend service in `backend/` for secure authentication and protected APIs.

### Run backend

1. Install backend dependencies:
   ```bash
   cd backend
   npm install
   copy .env.example .env
   npm run dev
   ```

2. Or run from repository root:
   ```bash
   npm run backend:dev
   ```

Backend default URL: `http://localhost:4000`

Available endpoints:
- `GET /health`
- `POST /auth/login`
- `POST /auth/signup/passenger`
- `GET /auth/me` (requires `Authorization: Bearer <token>`)
- `GET /schedules` (requires `Authorization: Bearer <token>`)

## Available Scripts

In the project directory, you can run:

- `npm run dev`: Starts the Vite development server.
- `npm run build`: Compiles TypeScript and builds the app for production to the `dist` folder.
- `npm run preview`: Locally previews the production build.
- `npm run backend:dev`: Starts backend dev server from `backend/`.
- `npm run backend:typecheck`: Type-checks backend TypeScript code.
- `npm run lint`: Lints the source files using ESLint.
- `npm run format`: Formats code using Prettier.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request