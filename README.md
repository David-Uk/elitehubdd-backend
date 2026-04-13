# Elite Hub by Double D — Backend

Node.js/Express REST API for the Elite Hub hotel management system. Built with PostgreSQL, Sequelize, Redis, Socket.io, and Swagger.

---

## Prerequisites

- Node.js >= 18
- PostgreSQL database
- Redis instance
- Cloudinary account (for image uploads)
- SMTP email service

---

## Setup

**1. Install dependencies**

```bash
npm install
```

**2. Configure environment variables**

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

| Variable | Description |
|---|---|
| `DB_HOST` | PostgreSQL host |
| `DB_PORT` | PostgreSQL port (default: 5432) |
| `DB_USER` | Database user |
| `DB_PASSWORD` | Database password |
| `DB_NAME` | Database name |
| `NODE_ENV` | `development`, `test`, or `production` |
| `PORT` | Server port (default: 3000) |
| `JWT_SECRET` | Secret key for JWT signing |
| `JWT_EXPIRE` | Token expiry (e.g. `30d`) |
| `DB_SSL` | Enable SSL for DB (`true`/`false`) |
| `DB_SSL_CA` | Path to SSL CA certificate (e.g. `ca.pem`) |
| `REDIS_URL` | Redis connection URL |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `ALLOWED_ORIGINS` | Comma-separated CORS origins |
| `EMAIL_HOST` | SMTP host |
| `EMAIL_PORT` | SMTP port |
| `EMAIL_USER` | SMTP username |
| `EMAIL_PASS` | SMTP password |
| `EMAIL_FROM` | Sender email address |
| `CLIENT_URL` | Frontend URL (for password reset links) |

**3. Run database migrations**

```bash
npm run db:migrate
```

**4. Seed the database** (optional — demo data)

```bash
npm run db:seed
```

---

## Running the Application

| Command | Description |
|---|---|
| `npm run dev` | Development mode with file watching |
| `npm start` | Test environment with SSL |
| `npm run prod` | Production mode |
| `npm run start:prod` | Production with memory optimisation |
| `npm run cpanel` | cPanel deployment |
| `npm run pm2:start` | Start with PM2 process manager |

---

## Database Commands

| Command | Description |
|---|---|
| `npm run db:migrate` | Run migrations (test env) |
| `npm run db:migrate:prod` | Run migrations (production) |
| `npm run db:migrate:undo` | Undo last migration |
| `npm run db:seed` | Seed database (test env) |
| `npm run db:seed:prod` | Seed database (production) |
| `npm run db:reset` | Undo all → migrate → seed (test env) |
| `npm run db:reset:prod` | Undo all → migrate → seed (production) |

---

## API Documentation

Interactive Swagger UI is available once the server is running:

```
http://localhost:3000/api-docs
```

Additional documentation files:

- `GUEST_RESERVATION_API.md` — Public guest booking endpoints
- `NOTIFICATIONS_API.md` — Notification system and activity logging
- `CORS_UPDATED.md` — CORS configuration
- `DATA_CLEAR_ENDPOINT.md` — Data clearing endpoints

---

## API Endpoints

Base URL: `http://localhost:3000/api`

### Auth — `/api/auth`

| Method | Endpoint | Access |
|---|---|---|
| POST | `/login` | Public |
| POST | `/forgot-password` | Public |
| POST | `/reset-password/:token` | Public |
| POST | `/register-super-admin` | Public (one-time setup) |
| POST | `/register` | Authenticated (admin creates staff) |
| POST | `/register-admin` | Authenticated (super_admin only) |
| GET | `/profile` | Authenticated |
| POST | `/change-password` | Authenticated |

---

### Reservations — `/api/reservations`

| Method | Endpoint | Access |
|---|---|---|
| GET | `/available` | Public |
| GET | `/availability/check` | Public |
| POST | `/guest` | Public |
| POST | `/` | super_admin, admin, accountant, supervisor, manager, receptionist |
| GET | `/` | super_admin, admin, accountant, supervisor, manager, receptionist |
| GET | `/:id` | super_admin, admin, accountant, supervisor, manager, receptionist |
| POST | `/:id/check-in` | super_admin, admin, accountant, supervisor, manager, receptionist |
| POST | `/:id/check-out` | super_admin, admin, accountant, supervisor, manager, receptionist |
| POST | `/:id/cancel` | super_admin, admin, accountant, supervisor, manager |

---

### Rooms — `/api/rooms`

| Method | Endpoint | Access |
|---|---|---|
| GET | `/available` | Public |
| POST | `/` | super_admin, admin |
| GET | `/` | super_admin, admin, accountant, supervisor, manager, receptionist |
| GET | `/:id` | super_admin, admin, accountant, supervisor, manager, receptionist |
| GET | `/number/:roomNumber` | super_admin, admin, accountant, supervisor, manager, receptionist |

---

### Room Types — `/api/room-types`

| Method | Endpoint | Access |
|---|---|---|
| GET | `/` | super_admin, admin, accountant, supervisor, manager, receptionist |
| GET | `/:id` | super_admin, admin, accountant, supervisor, manager, receptionist |
| GET | `/name/:name` | super_admin, admin, accountant, supervisor, manager, receptionist |

---

### Restaurant — `/api/restaurant`

| Method | Endpoint | Access |
|---|---|---|
| GET | `/menu` | Public |
| POST | `/menu` | super_admin, admin |
| POST | `/orders` | super_admin, admin, supervisor, kitchen_staff, waiter |
| GET | `/orders` | super_admin, admin, accountant, supervisor, kitchen_staff |
| GET | `/orders/:id` | super_admin, admin, accountant, supervisor, kitchen_staff |
| PATCH | `/orders/:id/status` | super_admin, admin, accountant, supervisor, kitchen_staff |
| POST | `/orders/:id/payment` | super_admin, admin, accountant, supervisor, kitchen_staff |
| DELETE | `/orders/delete-all` | super_admin only |
| GET | `/batches` | super_admin, admin, accountant, supervisor, kitchen_staff |
| GET | `/batches/date/:date` | super_admin, admin, accountant, supervisor, kitchen_staff |
| GET | `/batches/:id` | super_admin, admin, accountant, supervisor, kitchen_staff |
| POST | `/batch-orders` | super_admin, admin, supervisor, kitchen_staff, waiter |
| GET | `/batch-orders` | super_admin, admin, accountant, supervisor |
| POST | `/batches/:batchId/orders` | super_admin, admin, supervisor, kitchen_staff, waiter |
| PATCH | `/batches/:id/status` | super_admin, admin, supervisor, kitchen_staff, waiter |
| POST | `/batches/:id/complete` | super_admin, admin, supervisor, kitchen_staff, waiter |
| POST | `/batches/:id/cancel` | super_admin, admin, supervisor, kitchen_staff, waiter |
| PATCH | `/batches/:id/edit` | super_admin, admin, supervisor, kitchen_staff, waiter |
| PATCH | `/order-items/:itemId` | super_admin, admin, supervisor, kitchen_staff, waiter |
| PATCH | `/order-items/:itemId/status` | super_admin, admin, supervisor, kitchen_staff, waiter |

---

### Bar — `/api/bar`

| Method | Endpoint | Access |
|---|---|---|
| GET | `/items` | Authenticated |
| POST | `/items` | super_admin, admin |
| PATCH | `/items/:id/stock` | super_admin, admin, accountant, supervisor |
| POST | `/orders` | super_admin, admin, supervisor, bar_staff, waiter |
| GET | `/orders` | super_admin, admin, accountant, supervisor, waiter |
| GET | `/orders/:id` | super_admin, admin, accountant, supervisor, waiter |
| PATCH | `/orders/:id/status` | super_admin, admin, accountant, supervisor, waiter |
| POST | `/orders/:id/payment` | super_admin, admin, accountant, supervisor, waiter |

---

### Inventory — `/api/inventory`

| Method | Endpoint | Access |
|---|---|---|
| POST | `/items` | super_admin, admin |
| POST | `/items/batch` | super_admin, admin |
| GET | `/items` | Authenticated |
| GET | `/items/:id` | Authenticated |
| PATCH | `/items/:id` | super_admin, admin |
| DELETE | `/items/:id` | super_admin, admin |
| POST | `/items/:itemId/stock` | super_admin, admin |
| POST | `/items/:itemId/allocate` | super_admin, admin |
| GET | `/items/:itemId/history` | Authenticated |
| POST | `/items/:itemId/allocations` | super_admin, admin |
| GET | `/items/:itemId/allocations` | Authenticated |
| POST | `/items/:itemId/additions` | super_admin, admin |
| GET | `/items/:itemId/additions` | Authenticated |
| POST | `/items/:itemId/subtractions` | super_admin, admin |
| GET | `/items/:itemId/subtractions` | Authenticated |
| GET | `/items/:itemId/transactions` | Authenticated |
| GET | `/allocations/bar` | Authenticated |
| GET | `/allocations/restaurant` | Authenticated |
| GET | `/allocations/department/:departmentCode` | Authenticated |

---

### Guests — `/api/guests`

| Method | Endpoint | Access |
|---|---|---|
| POST | `/` | super_admin, admin, manager, receptionist |
| GET | `/` | super_admin, admin, manager, receptionist, accountant, supervisor |
| GET | `/search` | super_admin, admin, manager, receptionist, accountant, supervisor |
| GET | `/:id` | super_admin, admin, manager, receptionist, accountant, supervisor |
| PUT | `/:id` | super_admin, admin, manager, receptionist |
| DELETE | `/:id` | super_admin, admin |

---

### Users / Staff — `/api/users`

| Method | Endpoint | Access |
|---|---|---|
| GET | `/` | super_admin, admin |
| GET | `/:id` | super_admin, admin |
| PATCH | `/:id` | super_admin, admin |
| DELETE | `/:id` | super_admin, admin |
| GET | `/staff/all` | super_admin, admin |
| PATCH | `/staff/:id` | super_admin, admin |

---

### Departments — `/api/departments`

| Method | Endpoint | Access |
|---|---|---|
| GET | `/` | Authenticated |
| GET | `/:id` | Authenticated |
| GET | `/:id/stats` | Authenticated |
| POST | `/` | super_admin, admin |
| PUT | `/:id` | super_admin, admin |
| DELETE | `/:id` | super_admin, admin |

---

### Reports — `/api/reports`

| Method | Endpoint | Access |
|---|---|---|
| GET | `/revenue` | super_admin, admin, accountant, supervisor |
| GET | `/occupancy` | super_admin, admin, accountant, supervisor, receptionist |
| GET | `/reservations` | super_admin, admin, accountant, supervisor, receptionist |
| GET | `/feedback` | super_admin, admin, accountant, supervisor |
| GET | `/top-rooms` | super_admin, admin, accountant, supervisor, receptionist |
| GET | `/guests` | super_admin, admin, accountant, supervisor, receptionist |

---

### Dashboard — `/api/dashboard`

| Method | Endpoint | Access |
|---|---|---|
| GET | `/stats` | super_admin, admin, manager, supervisor |
| POST | `/stats` | super_admin, admin, manager, supervisor |
| GET | `/occupancy` | super_admin, admin, manager, supervisor |
| GET | `/revenue` | super_admin, admin, manager, supervisor |

---

### Notifications — `/api/notifications`

| Method | Endpoint | Access |
|---|---|---|
| GET | `/` | super_admin, admin, supervisor, kitchen_staff, waiter, accountant |
| GET | `/stats` | super_admin, admin, supervisor, kitchen_staff, waiter, accountant |
| PATCH | `/:id/read` | super_admin, admin, supervisor, kitchen_staff, waiter, accountant |
| DELETE | `/clear-all` | super_admin only |

---

### Uploads — `/api/uploads`

| Method | Endpoint | Access |
|---|---|---|
| POST | `/profile` | Authenticated |
| POST | `/room/:roomId` | super_admin, admin, manager, receptionist, accountant, supervisor |
| POST | `/room/:roomId/multiple` | super_admin, admin, manager, receptionist, accountant, supervisor |
| POST | `/menu/:menuItemId` | super_admin, admin, manager, restaurant_staff, kitchen_staff, accountant, supervisor |
| POST | `/bar/:barItemId` | super_admin, admin, manager, bar_staff, waiter, accountant, supervisor |
| POST | `/with-size-limit` | super_admin, admin, manager |
| DELETE | `/:publicId` | super_admin, admin, manager |
| GET | `/stats` | Authenticated |

---

### Data Clear — `/api/data-clear`

| Method | Endpoint | Access |
|---|---|---|
| GET | `/summary` | super_admin, admin |
| DELETE | `/clear-all` | super_admin only |

---

## User Roles

| Role | Description |
|---|---|
| `super_admin` | Full system access including data clearing and super admin registration |
| `admin` | Full access except data clearing |
| `manager` | Dashboard, reports, reservations, guests, staff management |
| `supervisor` | Dashboard, reports, orders, guests — no inventory or staff access |
| `accountant` | Reports, revenue, bar/restaurant orders — no staff access |
| `receptionist` | Reservations, rooms, guests, occupancy reports |
| `kitchen_staff` | Restaurant orders, batches, menu items |
| `waiter` | Restaurant and bar orders |
| `bar_staff` | Bar orders and items |

---

## Other Endpoints

| Endpoint | Description |
|---|---|
| `GET /health` | Health check |
| `GET /metrics` | Server metrics |
| `GET /api-docs` | Swagger UI |
