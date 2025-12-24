# EliteHub Hotel Management System

A comprehensive hotel management system built with Node.js, Express, Sequelize, and PostgreSQL using **ES6 modules**.

## 🏨 Features

- **Staff Authentication** - Role-based access control with JWT
- **Reservation Management** - Complete booking system with check-in/check-out
- **Room Management** - Multiple room types with status tracking
- **Restaurant Operations** - Menu management and order processing
- **Bar Operations** - Inventory management and order tracking
- **Reports & Analytics** - Revenue, occupancy, and performance reports
- **Feedback System** - Guest reviews and ratings

## 🚀 Quick Start

### Prerequisites

- Node.js (v14+)
- PostgreSQL (v12+)
- npm or yarn

### Installation

1. **Clone and navigate to the project**

```bash
cd backend
```

2. **Install dependencies**

```bash
npm install
```

3. **Setup environment variables**

```bash
copy .env.example .env
```

Edit `.env` with your database credentials:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=elitehub_dev
JWT_SECRET=your_secret_key
```

4. **Create PostgreSQL database**

```sql
CREATE DATABASE elitehub_dev;
```

5. **Run migrations** (after creating them)

```bash
npm run db:migrate
```

6. **Start the server**

```bash
npm start
# or for development with auto-reload
npm run dev
```

The server will start on `http://localhost:3000`

## 📚 Documentation

- **[API Documentation](./API_DOCUMENTATION.md)** - Complete API reference
- **[Project Summary](./PROJECT_SUMMARY.md)** - Detailed implementation overview
- **[Setup Guide](./SETUP.md)** - Quick setup instructions

## 🏗️ Architecture

### Project Structure

```
backend/
├── config/          # Configuration files
├── models/          # Sequelize models (12 models)
├── services/        # Business logic layer
├── controllers/     # Request handlers
├── routes/          # API routes
├── middleware/      # Custom middleware
├── migrations/      # Database migrations
├── seeders/         # Database seeders
└── server.js        # Application entry point
```

### Tech Stack

- **Runtime:** Node.js with ES6 modules
- **Framework:** Express.js
- **Database:** PostgreSQL
- **ORM:** Sequelize
- **Authentication:** JWT + Bcrypt
- **Logging:** Morgan

## 📋 API Endpoints

### Authentication

- `POST /api/auth/register` - Register staff
- `POST /api/auth/login` - Login
- `GET /api/auth/profile` - Get profile
- `POST /api/auth/change-password` - Change password

### Reservations

- `POST /api/reservations` - Create reservation
- `GET /api/reservations` - List reservations
- `POST /api/reservations/:id/check-in` - Check-in
- `POST /api/reservations/:id/check-out` - Check-out

### Restaurant

- `GET /api/restaurant/menu` - Get menu
- `POST /api/restaurant/orders` - Create order
- `GET /api/restaurant/orders` - List orders

### Bar

- `GET /api/bar/items` - Get bar items
- `POST /api/bar/orders` - Create order
- `PATCH /api/bar/items/:id/stock` - Update stock

### Reports (Admin/Manager only)

- `GET /api/reports/revenue` - Revenue report
- `GET /api/reports/occupancy` - Occupancy report
- `GET /api/reports/feedback` - Feedback summary

See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for complete details.

## 🗄️ Database Models

1. **Staff** - Employee management
2. **Guest** - Customer information
3. **Room** - Hotel rooms
4. **RoomType** - Room categories
5. **Reservation** - Bookings
6. **MenuItem** - Restaurant menu
7. **RestaurantOrder** - Restaurant orders
8. **RestaurantOrderItem** - Order items
9. **BarItem** - Bar inventory
10. **BarOrder** - Bar orders
11. **BarOrderItem** - Bar order items
12. **Feedback** - Guest reviews

## 🔐 Staff Roles

- **Admin** - Full system access
- **Manager** - Management and reporting
- **Receptionist** - Reservation management
- **Housekeeping** - Room status updates
- **Restaurant Staff** - Restaurant operations
- **Bar Staff** - Bar operations
- **Maintenance** - Maintenance tasks

## 🧪 Testing

### Test the API

1. **Register an admin user**

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "email": "admin@elitehub.com",
    "password": "Admin123!",
    "firstName": "Admin",
    "lastName": "User",
    "phoneNumber": "+1234567890",
    "role": "admin"
  }'
```

2. **Login**

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@elitehub.com",
    "password": "Admin123!"
  }'
```

3. **Use the returned token for authenticated requests**

```bash
curl -X GET http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 📝 Available Scripts

```bash
npm start              # Start server
npm run dev            # Start with auto-reload
npm run db:migrate     # Run migrations
npm run db:migrate:undo # Undo last migration
npm run db:seed        # Run seeders
npm run db:reset       # Reset database
```

## 🔄 Creating Migrations

You'll need to create migrations for all models. Example:

```bash
npx sequelize-cli migration:generate --name create-staff-table
```

Then edit the migration file and run:

```bash
npm run db:migrate
```

**Recommended migration order:**

1. Staff
2. Guest
3. RoomType
4. Room
5. Reservation
6. MenuItem
7. RestaurantOrder
8. RestaurantOrderItem
9. BarItem
10. BarOrder
11. BarOrderItem
12. Feedback

## 🌱 Seeding Data

Create seeders for initial data:

```bash
npx sequelize-cli seed:generate --name demo-staff
npx sequelize-cli seed:generate --name demo-room-types
npx sequelize-cli seed:generate --name demo-rooms
```

Then run:

```bash
npm run db:seed
```

## 🔍 Health Check

Check if the server and database are running:

```bash
curl http://localhost:3000/health
```

## 📊 Features by Module

### Reservation Module

- Create, read, update reservations
- Check-in/check-out workflow
- Guest information management
- Room assignment
- Payment tracking
- Special requests

### Restaurant Module

- Menu management
- Order creation and tracking
- Multiple order types (dine-in, room service, takeaway)
- Order status workflow
- Payment processing
- Tax and service charge calculation

### Bar Module

- Inventory management
- Stock tracking and alerts
- Order management
- Payment processing
- Category-based organization

### Reporting Module

- Revenue analytics
- Occupancy tracking
- Reservation statistics
- Guest feedback analysis
- Performance metrics

## 🚀 Production Deployment

Before deploying to production:

1. Set `NODE_ENV=production`
2. Use strong `JWT_SECRET`
3. Enable SSL/TLS
4. Set up proper logging
5. Implement rate limiting
6. Add request validation
7. Set up monitoring
8. Configure backups
9. Use process manager (PM2)
10. Set up reverse proxy (Nginx)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

ISC

## 👥 Author

David Ukelere

## 🙏 Acknowledgments

- Sequelize for the excellent ORM
- Express.js team
- PostgreSQL community

## 📞 Support

For detailed API documentation, see [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

For implementation details, see [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md)

---

**Built with ❤️ for EliteHub Hotel Management**
