# PS5 Reservation Backend Development Guide

> This document specifies the backend architecture, conventions, and workflows for the PS5
> reservation web project. The backend targets a **Go (Gin) + MySQL** stack with manual
> payment verification and WeChat mini-program style authentication adapted for the web.
> It complements the frontend scope defined in the project README and the product demand
> document.

## 1. Architecture Overview

### 1.1 Goals

- Provide RESTful APIs that power the reservation, order, and payment-proof flows for a
  single PlayStation 5 resource.
- Support basic administrator tooling for manual payment verification and configuration
  management.
- Optimise for simplicity and maintainability over high concurrency. Single-instance
  deployment is acceptable.

### 1.2 High-Level Components

| Layer            | Responsibility                                                        |
| ---------------- | --------------------------------------------------------------------- |
| HTTP API         | Gin handlers exposing public (user) and admin endpoints.              |
| Service          | Orchestrates business rules (slot locking, order creation, etc.).     |
| Repository       | Encapsulates MySQL queries and transactions.                          |
| Background Jobs  | Periodic expiration sweeps to release stale reservations.            |
| Integration      | WeChat authentication (code -> session) or equivalent OAuth adapter. |
| Storage          | MySQL for relational data, optional object storage for proof images.  |

### 1.3 Process Model

- Deploy as a single Go binary behind an HTTP reverse proxy (e.g., Nginx or Caddy).
- Use a connection-pooled MySQL client (`database/sql` + `go-sql-driver/mysql`).
- Use Redis (optional) for caching session tokens or rate limiting. Not required for MVP.

### 1.4 Directory Layout (proposed)

```
backend/
├── cmd/
│   └── server/           # main entry point (Gin HTTP server)
├── internal/
│   ├── api/              # HTTP handlers & routing
│   ├── auth/             # WeChat login adapters, JWT utilities
│   ├── config/           # configuration loading & validation
│   ├── jobs/             # background schedulers (expiration scan)
│   ├── middleware/       # logging, recovery, auth guard
│   ├── models/           # domain models & DTOs
│   ├── repository/       # database access
│   ├── service/          # business logic orchestrators
│   └── utils/            # shared helpers (time, validation)
├── migrations/           # SQL migration files
├── scripts/              # local tooling (e.g., dev DB bootstrap)
└── go.mod                # module definition
```

## 2. Environment & Tooling

### 2.1 Go Runtime

- Go 1.22+ (modules enabled).
- Use `golangci-lint` for linting and `go test ./...` for unit tests.

### 2.2 MySQL

- MySQL 8.0+ with timezone configured to `+08:00`.
- Use UTF8MB4 charset and `utf8mb4_unicode_ci` collation.
- Create a dedicated database (e.g., `ps5_reservation`).

### 2.3 Configuration

- Prefer environment variables loaded via `internal/config` (e.g., using `caarlos0/env`).
- Suggested variables:
  - `APP_ENV` (`development`, `staging`, `production`).
  - `HTTP_ADDR` (default `:8080`).
  - `MYSQL_DSN` (user:pass@tcp(host:port)/db?parseTime=true&loc=Local).
  - `JWT_SECRET`, `JWT_TTL`.
  - `WECHAT_APPID`, `WECHAT_SECRET` or equivalent auth provider keys.
  - `PAY_QR_URL` (fallback static asset URL).
  - `HOLD_MINUTES`, `PRICE_PER_HOUR`, `BUSINESS_HOURS` (optional overrides).

### 2.4 Local Development Workflow

1. Copy `.env.example` to `.env` and populate secrets.
2. Run `make db-up` (Docker-compose) or local MySQL instance.
3. Apply migrations via `make migrate-up` (uses `golang-migrate`).
4. Launch server: `go run ./cmd/server`.
5. Use HTTP client (Hoppscotch, Insomnia) to exercise APIs.

## 3. Data Model

Table design follows the product specification. Primary keys are `BIGINT UNSIGNED` with
`AUTO_INCREMENT`.

### 3.1 users

| Column      | Type                | Notes                                            |
| ----------- | ------------------- | ------------------------------------------------ |
| id          | BIGINT UNSIGNED PK  |                                                  |
| open_id     | VARCHAR(64) UNIQUE  | From WeChat login or equivalent identifier.      |
| union_id    | VARCHAR(64) NULL    | Optional cross-app identifier.                   |
| nickname    | VARCHAR(64) NULL    | Cached from WeChat profile.                      |
| avatar_url  | VARCHAR(255) NULL   |                                                  |
| created_at  | DATETIME(3)         | Default `CURRENT_TIMESTAMP(3)`.                  |
| updated_at  | DATETIME(3)         | `ON UPDATE CURRENT_TIMESTAMP(3)`.                |

### 3.2 reservations

| Column       | Type                | Notes                                                       |
| ------------ | ------------------- | ----------------------------------------------------------- |
| id           | BIGINT UNSIGNED PK  |                                                             |
| user_id      | BIGINT UNSIGNED FK  | References `users.id`.                                      |
| start_time   | DATETIME(0)         | Rounded to nearest hour, timezone UTC+8.                    |
| end_time     | DATETIME(0)         | `start_time + INTERVAL 1 HOUR`.                             |
| status       | ENUM                | `locked`, `confirmed`, `cancelled`, `expired`.              |
| order_id     | BIGINT UNSIGNED FK  | Nullable reference to `orders.id`.                          |
| created_at   | DATETIME(3)         |                                                             |
| updated_at   | DATETIME(3)         |                                                             |
| UNIQUE(start_time)                 | Enforces single resource occupancy per slot.                |

### 3.3 orders

| Column       | Type                | Notes                                                                  |
| ------------ | ------------------- | ---------------------------------------------------------------------- |
| id           | BIGINT UNSIGNED PK  |                                                                        |
| order_no     | VARCHAR(32) UNIQUE  | Human-readable identifier (e.g., timestamp + random suffix).          |
| user_id      | BIGINT UNSIGNED FK  |                                                                        |
| reservation_id | BIGINT UNSIGNED FK | Back-reference to `reservations.id`.                                 |
| amount       | INT UNSIGNED        | Stored in cents.                                                       |
| status       | ENUM                | `pending`, `proof_submitted`, `paid`, `rejected`, `cancelled`, `expired`. |
| expire_at    | DATETIME(3)         | Creation time + hold duration.                                         |
| remark       | VARCHAR(255)        | Instruction for payment memo.                                         |
| created_at   | DATETIME(3)         |                                                                        |
| updated_at   | DATETIME(3)         |                                                                        |
| INDEX(user_id, status)             | Supports list filtering.                                               |

### 3.4 payment_proofs

| Column      | Type                | Notes                                        |
| ----------- | ------------------- | -------------------------------------------- |
| id          | BIGINT UNSIGNED PK  |                                              |
| order_id    | BIGINT UNSIGNED FK  | References `orders.id`.                      |
| image_url   | VARCHAR(255)        | Storage path (S3, COS, OSS, etc.).           |
| note        | VARCHAR(255) NULL   | User-provided memo or transaction ID.        |
| created_at  | DATETIME(3)         |                                              |

### 3.5 admins (optional)

| Column        | Type                | Notes                                      |
| ------------- | ------------------- | ------------------------------------------ |
| id            | BIGINT UNSIGNED PK  |                                           |
| username      | VARCHAR(64) UNIQUE  |                                           |
| password_hash | VARCHAR(255)        | Argon2id or bcrypt hashed password.       |
| role          | ENUM                | Only `admin` for MVP; extendable.         |
| created_at    | DATETIME(3)         |                                           |

### 3.6 settings (optional)

| Column   | Type                | Notes                                                       |
| -------- | ------------------- | ----------------------------------------------------------- |
| id       | BIGINT UNSIGNED PK  |                                                               |
| key      | VARCHAR(64) UNIQUE  | e.g., `price_per_hour`, `hold_minutes`, `pay_qr_url`.         |
| value    | TEXT                | JSON-encoded for complex values (business hours windows).     |
| updated_at | DATETIME(3)       |                                                               |

## 4. API Design

### 4.1 Authentication & Authorization

- **User login**: Exchange a WeChat `code` (or another OAuth flow) for an `openid`. Create
  or update the user record and issue a JWT with claims `{sub: user_id, exp, scope}`.
- **Admin login**: Username/password with session cookies or JWT (separate signing key).
- Middleware should enforce:
  - `Authorization: Bearer <token>` for user endpoints.
  - Role checks (e.g., `scope=admin`) for admin endpoints.

### 4.2 REST Endpoints

| Method | Path                                | Description                                            |
| ------ | ----------------------------------- | ------------------------------------------------------ |
| POST   | `/api/auth/wechat/login`            | Authenticate via WeChat code.                          |
| GET    | `/api/slots`                        | Query availability within a 72-hour window.            |
| POST   | `/api/reservations`                 | Create reservation + order (single atomic call).       |
| POST   | `/api/orders/{id}/cancel`           | Cancel pending order and release the slot.             |
| POST   | `/api/orders/{id}/proofs`           | Upload payment proofs (multipart).                     |
| GET    | `/api/orders`                       | List user orders with optional status filter.          |
| GET    | `/api/orders/{id}`                  | Order detail with reservation and proof data.          |
| POST   | `/api/admin/login`                  | Admin authentication.                                  |
| GET    | `/api/admin/orders`                 | Filterable order dashboard for verification.           |
| POST   | `/api/admin/orders/{id}/verify`     | Confirm or reject payment (`pass`, `reason`).          |
| GET    | `/api/admin/settings`               | Retrieve configurable values (QR code URL, price, etc.). |
| POST   | `/api/admin/settings`               | Update configuration entries.                          |

**Error Handling**: Return JSON payload `{ "code": 4001, "message": "slot unavailable" }`
with HTTP status 400/401/403/404/409 as appropriate.

### 4.3 Upload Handling

- Accept up to 3 images per order. Enforce size (≤ 5 MiB) and type (`image/jpeg`, `image/png`).
- Store files in:
  - Local disk (`/var/app/uploads`) for development.
  - Cloud object storage for production (signed URL flow recommended).
- Persist final URL in `payment_proofs.image_url`.

### 4.4 Rate Limiting & Quotas

- Limit each user to one `pending` or `proof_submitted` order.
- Consider simple IP-based rate limiting for reservation creation to deter abuse.

## 5. Business Logic Notes

### 5.1 Slot Generation & Locking

1. Compute server time in UTC+8, round up to next hour.
2. Generate slots for `[now, now + 72h)`. Query `reservations` within this range.
3. A slot is **available** if there is no reservation with status `locked` or `confirmed`.
4. When creating a reservation:
   - Start transaction.
   - `SELECT ... FOR UPDATE` on `reservations` table (or insert with unique constraint).
   - Insert reservation with status `locked` and create associated order with status `pending`.
   - Commit.

### 5.2 Order Expiration

- `expire_at = created_at + hold_minutes` (default 15 minutes).
- Background job (`jobs/expiration`) runs every minute:
  - Find orders `status IN ('pending','proof_submitted') AND expire_at < now`.
  - Update order to `expired`, reservation to `expired` (or `cancelled`).
- Alternatively, enforce expiration lazily on read (`WHERE expire_at < now` -> treat as expired).

### 5.3 Payment Verification Flow

- Users upload proof -> order status `proof_submitted`.
- Admin reviews proofs in dashboard. On approval:
  - Transaction: set order `paid`, reservation `confirmed`, log audit record.
- On rejection:
  - Order back to `pending`, attach rejection reason. Reservation remains `locked` until expiry.

### 5.4 Cancellation Rules

- Users may cancel only when order `pending` and before `expire_at`.
- Cancellation releases slot immediately (`reservation.status = cancelled`).
- Admins may force cancel (e.g., fraud detection) with audit log.

### 5.5 Timezone Handling

- Store all `DATETIME` in UTC+8 or UTC with offset conversion at application layer.
- When interacting with frontend, use ISO 8601 strings (e.g., `2024-03-01T10:00:00+08:00`).

## 6. Security Considerations

- Use HTTPS in production and secure cookies for admin sessions.
- Rate limit login attempts; store admin passwords with Argon2id/bcrypt.
- Validate JWT tokens with rotation support (refresh tokens optional for MVP).
- Ensure uploaded files are virus scanned if feasible; otherwise, restrict content type and size.
- Implement audit logging for admin actions (order verification, config changes).

## 7. Testing Strategy

### 7.1 Unit Tests

- Services: reservation creation, order state transitions, expiry logic.
- Repositories: verify SQL queries and transaction behavior using a test database.
- Utilities: time rounding, order number generation, JWT helpers.

### 7.2 Integration Tests

- Use `httptest` with in-memory database (sqlite + GORM) or dedicated MySQL schema.
- Cover happy path scenarios and error conditions (slot conflict, duplicate order).

### 7.3 End-to-End Smoke Tests

- With the frontend, run automated flows using Playwright or Cypress once endpoints exist.
- Simulate user login, slot selection, proof upload, admin approval.

## 8. Deployment Guide

### 8.1 Build & Release

- Compile binary: `GOOS=linux GOARCH=amd64 go build -o bin/server ./cmd/server`.
- Package with Docker (Alpine-based image recommended). Example Dockerfile:

```
FROM golang:1.22-alpine AS build
WORKDIR /app
COPY . .
RUN go build -o server ./cmd/server

FROM alpine:3.19
WORKDIR /srv
COPY --from=build /app/server ./server
COPY --from=build /app/config ./config
EXPOSE 8080
CMD ["./server"]
```

### 8.2 Runtime Dependencies

- MySQL instance reachable via secure network.
- Object storage credentials (if using cloud uploads).
- Systemd service or container orchestrator to manage process lifecycle.

### 8.3 Observability

- Structured logging (JSON) with request IDs.
- Metrics via Prometheus middleware (HTTP latency, request counts).
- Basic health checks: `/healthz` (DB connectivity) and `/readyz` (migrations applied).

## 9. Future Enhancements

- Support multiple PS5 units (slot capacity > 1) by introducing `capacity` column.
- Add notification service (WeChat subscribe messages, email) for reminders.
- Implement refund/rollback workflow for rejected payments.
- Introduce RBAC for admins and audit dashboards.
- Add GraphQL or gRPC endpoints if future clients require richer querying.

---

For coordination with the frontend team, prioritise aligning API contracts in `internal/api`
with the mocks currently residing in `frontend/src/services`. Update this document as the
implementation evolves.
