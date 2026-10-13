# Trading Journal API

A production-ready, secure, and tested RESTful API for journaling, tracking, and analyzing trading performance across financial markets (Forex, Crypto, Stocks, Indices, Commodities).

Built with **Node.js**, **Express 5**, **TypeScript (ESM NodeNext)**, **MongoDB**, and **Mongoose**, featuring strict input validation via **Zod**, JWT authentication with secure HttpOnly cookies, and centralized error handling.

---

## 1. Architectural Design

The backend follows a layered monolithic architecture with strict separation of concerns:

```text
backend/src/
├── config/         # Environment variables (Zod-validated), MongoDB connection, CORS
├── controllers/    # Request/Response orchestration, status codes, param validation
├── middleware/     # Auth (JWT/Cookie), Zod validate, rate limiters, error & 404 handlers
├── models/         # Mongoose schemas, compound query indexes, lifecycle hooks
├── repository/     # Direct database access, queries, projections, aggregations
├── routes/         # Versioned route declarations (/api/v1/...)
├── services/       # Core business logic, calculations, state transitions, analytics
├── types/          # Domain interfaces, DTOs, enums, status transitions
├── utils/          # ApiError, JWT helpers, bcrypt password hashing
├── app.ts          # Express application setup, security middleware pipeline
└── server.ts       # Server entry point, database connection, graceful shutdown
```

---

## 2. Core Concepts & Calculation Formulas

### Financial Formulas
1. **Planned Risk Amount (`riskAmount`)**:
   - Long: `(entryPrice - stopLoss) * quantity * contractSize`
   - Short: `(stopLoss - entryPrice) * quantity * contractSize`
2. **Planned Risk:Reward Ratio (`plannedRR`)**:
   - Long: `(takeProfit - entryPrice) / (entryPrice - stopLoss)`
   - Short: `(entryPrice - takeProfit) / (stopLoss - entryPrice)`
3. **Gross P&L (`pnlGross`)**:
   - Long: `(exitPrice - entryPrice) * quantity * contractSize`
   - Short: `(entryPrice - exitPrice) * quantity * contractSize`
4. **Net P&L (`pnlNet`)**:
   - `pnlGross - fees`
5. **Realized R-Multiple (`rMultiple`)**:
   - `pnlNet / riskAmount` (when planned risk > 0)
6. **Profit Factor (`profitFactor`)**:
   - `grossProfit / grossLoss` (returns `null` when no losing trades exist to avoid division by zero)

### Documented Assumptions & Limitations
- **Currency Convention**: P&L calculations assume quote currency matches account base currency. Cross-currency FX conversion is not performed in MVP.
- **Contract Size**: Defaults to `1` (for equities, single crypto units). For standard Forex lots, set `contractSize = 100000`.
- **Trade Deletions**: Permanently deleted (hard-delete) to align with existing test suite and privacy expectations.

---

## 3. Environment Variables Configuration

Copy `.env.example` to `.env` in the `backend/` directory:

| Variable | Type | Default | Description |
|---|---|---|---|
| `NODE_ENV` | String | `development` | Environment mode (`development`, `production`, `test`) |
| `PORT` | Number | `5000` | Port on which the Express server listens |
| `MONGODB_URI` | String | *Required* | MongoDB connection URI (local or MongoDB Atlas) |
| `JWT_SECRET` | String | *Required* | Secret key for signing Access Tokens (min 10 chars) |
| `JWT_EXPIRES_IN` | String | `15m` | Access Token lifespan |
| `JWT_REFRESH_SECRET` | String | *Required* | Secret key for signing Refresh Tokens (min 10 chars) |
| `JWT_REFRESH_EXPIRES_IN`| String | `7d` | Refresh Token lifespan |
| `CLIENT_URL` | String | `http://localhost:5173` | Allowed frontend origin for CORS credentials |

---

## 4. API Endpoints Reference

All versioned routes are prefixed with `/api/v1`.

### System Health
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/health` | Public | System & MongoDB connectivity health check |
| `GET` | `/api` | Public | API root status |

### Authentication (`/api/v1/auth`)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/register` | Public (Rate Limited) | Register a new user |
| `POST` | `/login` | Public (Rate Limited) | Authenticate user, receive JWTs |
| `POST` | `/refresh` | Public | Reissue access token via Refresh cookie |
| `POST` | `/logout` | Public | Clear auth cookies |
| `GET` | `/me` | Bearer / Cookie | Get authenticated user profile |
| `POST` | `/forgot-password` | Public (Rate Limited) | Request password reset |
| `POST` | `/reset-password` | Public (Rate Limited) | Reset password with token |

### User Profile (`/api/v1/users`)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/:id` | Bearer / Cookie | Get user by ID (owner or admin) |

### Trades Module (`/api/v1/trades`)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/` | Bearer / Cookie | Create a new trade |
| `GET` | `/` | Bearer / Cookie | List user trades (supports filtering & pagination) |
| `GET` | `/analytics` | Bearer / Cookie | Retrieve calculated trading performance analytics |
| `GET` | `/:id` | Bearer / Cookie | Retrieve a specific trade by ID |
| `PUT` / `PATCH`| `/:id` | Bearer / Cookie | Update trade properties |
| `POST` | `/:id/close` | Bearer / Cookie | Dedicated operation to close an open trade |
| `DELETE` | `/:id` | Bearer / Cookie | Delete a trade |

---

## 5. API Request & Response Examples

### Create Trade
**`POST /api/v1/trades`**
```json
{
  "symbol": "EURUSD",
  "market": "forex",
  "direction": "long",
  "entryPrice": 1.0850,
  "stopLoss": 1.0800,
  "takeProfit": 1.0950,
  "quantity": 1,
  "contractSize": 100000,
  "fees": 5.0,
  "strategy": "Trend Continuation",
  "notes": "Broke out of 4h consolidation"
}
```
**Response (`201 Created`):**
```json
{
  "success": true,
  "message": "Trade created successfully",
  "data": {
    "_id": "670c79313b28b76dfb37c001",
    "userId": "670c79313b28b76dfb37b001",
    "symbol": "EURUSD",
    "market": "forex",
    "direction": "long",
    "entryPrice": 1.085,
    "quantity": 1,
    "contractSize": 100000,
    "stopLoss": 1.08,
    "takeProfit": 1.095,
    "fees": 5,
    "riskAmount": 500,
    "plannedRR": 2,
    "status": "open",
    "entryAt": "2026-10-13T05:30:00.000Z",
    "createdAt": "2026-10-13T05:30:00.000Z"
  }
}
```

### Dedicated Close Trade
**`POST /api/v1/trades/:id/close`**
```json
{
  "exitPrice": 1.0930,
  "fees": 7.5,
  "notes": "Target reached, partial exited manually"
}
```
**Response (`200 OK`):**
```json
{
  "success": true,
  "message": "Trade closed successfully",
  "data": {
    "_id": "670c79313b28b76dfb37c001",
    "symbol": "EURUSD",
    "status": "closed",
    "entryPrice": 1.085,
    "exitPrice": 1.093,
    "pnlGross": 800,
    "pnlNet": 792.5,
    "rMultiple": 1.59,
    "exitAt": "2026-10-13T05:45:00.000Z"
  }
}
```

### Get Performance Analytics
**`GET /api/v1/trades/analytics?market=forex`**
**Response (`200 OK`):**
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalTrades": 25,
      "openTrades": 5,
      "closedTrades": 18,
      "cancelledTrades": 2
    },
    "performance": {
      "winningTrades": 12,
      "losingTrades": 5,
      "breakEvenTrades": 1,
      "winRate": 66.67,
      "lossRate": 27.78,
      "totalGrossPnl": 4200.0,
      "totalNetPnl": 3950.0,
      "totalFees": 250.0,
      "grossProfit": 5100.0,
      "grossLoss": 1150.0,
      "averageWin": 425.0,
      "averageLoss": 230.0,
      "profitFactor": 4.43,
      "averageRMultiple": 1.85,
      "expectancy": 219.44
    }
  }
}
```

### System Health
**`GET /api/health`**
**Response (`200 OK`):**
```json
{
  "status": "healthy",
  "uptime": 1284.52,
  "timestamp": "2026-10-13T05:30:00.000Z",
  "services": {
    "database": {
      "status": "connected",
      "connected": true
    }
  }
}
```

---

## 6. Running Locally & Testing

### Installation
```bash
cd backend
npm install
```

### Type Checking & Compilation
```bash
npm run build
```

### Running Test Suite
```bash
npm test
```

### Starting in Development Mode
```bash
npm run dev
```

### Starting in Production Mode
```bash
npm start
```

---

## 7. Docker Deployment

### Building and Running with Docker Compose
```bash
cd backend
docker compose up -d --build
```
The API will be exposed on port `5000` with automated container restart policies.