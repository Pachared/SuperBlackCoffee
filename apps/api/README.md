# API

Go + Gin + PostgreSQL backend for Super Black Coffee.

## Core API

- `POST /api/v1/auth/login` — issues a JWT access token.
- `GET /api/v1/dashboard` — scoped sales summary.
- `GET|POST /api/v1/inventory`, `PATCH|DELETE /api/v1/inventory/:id` — branch inventory.
- `GET|POST /api/v1/stock-requests` — branch request history and central-office requests.
- `PATCH /api/v1/stock-requests/:id/status` — central-office workflow.
- `POST /api/v1/pos/orders` — records a paid POS order.
- `GET|POST /api/v1/franchisees` — admin-only franchise onboarding.

Set `SEED_DEMO_DATA=true` for local demo data. The demo administrator is
`admin@superblackcoffee.local` with password `password`. The seeded branch manager is
`manager@superblackcoffee.local` with password `password`. Both must only be used locally.
