# Trading Journal App

A full-stack trading journal application designed to log, track, and analyze trading performance.

## Architecture & Project Structure

The backend follows a clean, layered architectural pattern with clear separation of concerns across dedicated layers:

```text
backend/src/
├── config/         # Environment variables, database connection, CORS settings
├── controllers/    # Request/response handlers, HTTP status codes, orchestration
├── middleware/     # Express middlewares (auth, validation, error handler, rate limiters)
├── models/         # Mongoose schemas, indexes, schema hooks, and data models
├── repository/     # Data access layer and database query abstractions
├── routes/         # API route declarations and versioned endpoint groupings (v1)
├── services/       # Core business logic, calculations, metrics, and workflows
├── types/          # Shared TypeScript interfaces, DTOs, and type definitions
├── utils/          # Reusable helper functions, JWT utils, hashing, custom ApiError
├── validators/     # Zod validation schemas for request payload validation
├── app.ts          # Express application setup and global middleware pipeline
└── server.ts       # Application entry point and server startup
```

## Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB

### Backend Setup
```bash
cd backend
npm install
npm run dev
```

### Running Tests & Building
```bash
cd backend
npm test
npm run build
```