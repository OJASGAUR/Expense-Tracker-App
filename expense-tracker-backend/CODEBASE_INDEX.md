# Expense Tracker Backend - Codebase Index

## Overview
A Node.js/Express REST API backend for an expense tracking application. Uses Prisma ORM with PostgreSQL database, JWT authentication, and provides endpoints for managing accounts, categories, transactions, budgets, and analytics.

## Technology Stack
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcrypt
- **CORS**: Enabled

## Project Structure

```
expense-tracker-backend/
├── index.js                    # Main application entry point
├── package.json                # Dependencies and scripts
├── prisma/
│   ├── schema.prisma          # Database schema definition
│   ├── migrations/            # Database migration files
│   └── prisma.config.ts      # Prisma configuration
└── src/
    ├── prisma.js              # Prisma client instance
    ├── middleware/
    │   └── authMiddleware.js  # JWT authentication middleware
    ├── routes/                # API route definitions
    │   ├── authRoutes.js
    │   ├── accountRoutes.js
    │   ├── categoryRoutes.js
    │   ├── transactionRoutes.js
    │   ├── budgetRoutes.js
    │   └── analyticsRoutes.js
    └── controllers/           # Business logic handlers
        ├── authController.js
        ├── accountController.js
        ├── categoryController.js
        ├── transactionController.js
        ├── budgetController.js
        └── analyticsController.js
```

## Database Schema (Prisma)

### Models

#### User
- `id` (String, UUID, Primary Key)
- `email` (String, Unique)
- `password` (String, Hashed)
- `createdAt` (DateTime)
- Relations: accounts, categories, transactions, budgets

#### Account
- `id` (String, UUID, Primary Key)
- `name` (String)
- `icon` (String, Optional)
- `isDeleted` (Boolean, Default: false)
- `createdAt` (DateTime)
- `updatedAt` (DateTime)
- `userId` (String, Foreign Key → User)
- Relations: transactions

#### Category
- `id` (String, UUID, Primary Key)
- `name` (String)
- `icon` (String, Optional)
- `type` (String: "income" | "expense")
- `isDeleted` (Boolean, Default: false)
- `createdAt` (DateTime)
- `updatedAt` (DateTime)
- `userId` (String, Foreign Key → User)
- Relations: transactions, budgets

#### Transaction
- `id` (String, UUID, Primary Key)
- `amount` (Float)
- `type` (String: "income" | "expense" | "transfer")
- `note` (String, Optional)
- `transferGroupId` (String, Optional - for linking transfer pairs)
- `isDeleted` (Boolean, Default: false)
- `createdAt` (DateTime)
- `updatedAt` (DateTime)
- `userId` (String, Foreign Key → User)
- `accountId` (String, Foreign Key → Account)
- `categoryId` (String, Optional, Foreign Key → Category)

#### Budget
- `id` (String, UUID, Primary Key)
- `amount` (Float)
- `month` (Int, 1-12)
- `year` (Int)
- `isDeleted` (Boolean, Default: false)
- `createdAt` (DateTime)
- `updatedAt` (DateTime)
- `userId` (String, Foreign Key → User)
- `categoryId` (String, Foreign Key → Category)

## API Endpoints

### Base URL
All API endpoints are prefixed with `/api`

### Authentication Routes (`/api/auth`)

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| POST | `/signup` | No | Create a new user account |
| POST | `/login` | No | Authenticate user and get JWT token |

**Request/Response Examples:**
- **Signup**: `POST /api/auth/signup`
  - Body: `{ "email": "user@example.com", "password": "password123" }`
  - Response: `{ "message": "User created successfully" }`

- **Login**: `POST /api/auth/login`
  - Body: `{ "email": "user@example.com", "password": "password123" }`
  - Response: `{ "token": "jwt_token", "user": { "id": "...", "email": "..." } }`

### Account Routes (`/api/accounts`)

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| POST | `/` | Yes | Create a new account |
| GET | `/` | Yes | Get all user accounts with calculated balances |
| DELETE | `/:id` | Yes | Soft delete an account |

**Request/Response Examples:**
- **Create Account**: `POST /api/accounts`
  - Headers: `Authorization: Bearer <token>`
  - Body: `{ "name": "Cash", "icon": "💰" }`
  - Response: Account object with id, name, icon, createdAt, updatedAt

- **Get Accounts**: `GET /api/accounts`
  - Headers: `Authorization: Bearer <token>`
  - Response: Array of accounts with calculated balance field

- **Delete Account**: `DELETE /api/accounts/:id`
  - Headers: `Authorization: Bearer <token>`
  - Response: `{ "message": "Account deleted" }`

### Category Routes (`/api/categories`)

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| POST | `/` | Yes | Create a new category |
| GET | `/` | Yes | Get all user categories |
| DELETE | `/:id` | Yes | Soft delete a category |

**Request/Response Examples:**
- **Create Category**: `POST /api/categories`
  - Headers: `Authorization: Bearer <token>`
  - Body: `{ "name": "Food", "icon": "🍔", "type": "expense" }`
  - Response: Category object

- **Get Categories**: `GET /api/categories`
  - Headers: `Authorization: Bearer <token>`
  - Response: Array of categories

- **Delete Category**: `DELETE /api/categories/:id`
  - Headers: `Authorization: Bearer <token>`
  - Response: `{ "message": "Category deleted" }`

### Transaction Routes (`/api/transactions`)

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| POST | `/` | Yes | Create a new transaction (income/expense/transfer) |
| GET | `/` | Yes | Get all user transactions |
| DELETE | `/:id` | Yes | Soft delete a transaction |

**Request/Response Examples:**
- **Create Income/Expense**: `POST /api/transactions`
  - Headers: `Authorization: Bearer <token>`
  - Body: `{ "amount": 100.50, "type": "expense", "note": "Lunch", "accountId": "...", "categoryId": "..." }`
  - Response: Transaction object

- **Create Transfer**: `POST /api/transactions`
  - Headers: `Authorization: Bearer <token>`
  - Body: `{ "amount": 500, "type": "transfer", "note": "Transfer to savings", "accountId": "...", "toAccountId": "..." }`
  - Response: `{ "message": "Transfer successful" }`

- **Get Transactions**: `GET /api/transactions`
  - Headers: `Authorization: Bearer <token>`
  - Response: Array of transactions (ordered by createdAt desc)

- **Delete Transaction**: `DELETE /api/transactions/:id`
  - Headers: `Authorization: Bearer <token>`
  - Response: `{ "message": "Transaction deleted" }`

### Budget Routes (`/api/budgets`)

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| POST | `/` | Yes | Create a new budget |
| GET | `/` | Yes | Get budgets for a specific month/year |
| DELETE | `/:id` | Yes | Soft delete a budget |

**Request/Response Examples:**
- **Create Budget**: `POST /api/budgets`
  - Headers: `Authorization: Bearer <token>`
  - Body: `{ "amount": 1000, "month": 1, "year": 2024, "categoryId": "..." }`
  - Response: Budget object

- **Get Budgets**: `GET /api/budgets?month=1&year=2024`
  - Headers: `Authorization: Bearer <token>`
  - Query Params: `month` (1-12), `year`
  - Response: Array of budgets with category included

- **Delete Budget**: `DELETE /api/budgets/:id`
  - Headers: `Authorization: Bearer <token>`
  - Response: `{ "message": "Budget deleted" }`

### Analytics Routes (`/api/analytics`)

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/expense-by-category` | Yes | Get expense totals grouped by category for a month |
| GET | `/account-analysis` | Yes | Get income vs expense grouped by account for a month |

**Request/Response Examples:**
- **Expense by Category**: `GET /api/analytics/expense-by-category?month=1&year=2024`
  - Headers: `Authorization: Bearer <token>`
  - Query Params: `month` (1-12), `year`
  - Response: Array of `{ categoryId, _sum: { amount } }`

- **Account Analysis**: `GET /api/analytics/account-analysis?month=1&year=2024`
  - Headers: `Authorization: Bearer <token>`
  - Query Params: `month` (1-12), `year`
  - Response: Array of `{ accountId, type, _sum: { amount } }`

### Health Check

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/health` | No | Server health check |

**Response**: `{ "status": "ok" }`

## Authentication

### JWT Token
- Token is generated on login and must be included in the `Authorization` header for protected routes
- Format: `Authorization: Bearer <token>`
- Token contains `userId` in the payload
- Secret key stored in `JWT_SECRET` environment variable

### Middleware
- `authMiddleware.js`: Validates JWT token and extracts `userId` from token, attaching it to `req.userId`

## Key Features

### 1. Soft Deletes
All entities (Account, Category, Transaction, Budget) use soft delete pattern with `isDeleted` flag instead of hard deletion.

### 2. Account Balance Calculation
The `getAccounts` endpoint calculates account balances by:
- Processing all transactions chronologically
- Adding income transactions
- Subtracting expense transactions
- Handling transfers (first transaction in group = source, second = destination)

### 3. Transfer Transactions
Transfers create two linked transactions:
- Both share the same `transferGroupId`
- First transaction (by createdAt) is the source (money out)
- Second transaction is the destination (money in)
- Created atomically using Prisma transactions

### 4. User Isolation
All data is scoped to the authenticated user via `req.userId` from JWT token.

## Environment Variables

Required environment variables:
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Secret key for JWT token signing
- `PORT`: Server port (defaults to 3000)

## Dependencies

### Production
- `@prisma/client`: Prisma ORM client
- `bcrypt`: Password hashing
- `cors`: CORS middleware
- `dotenv`: Environment variable management
- `express`: Web framework
- `jsonwebtoken`: JWT token handling

### Development
- `nodemon`: Development server with auto-reload
- `prisma`: Prisma CLI for migrations and schema management

## Scripts

- `npm start`: Run production server
- `npm run dev`: Run development server with nodemon

## Database Migrations

Migrations are stored in `prisma/migrations/`:
- `20260109085936_init`: Initial schema migration
- `20260109103151_add_budget`: Budget model addition

## Error Handling

- Authentication errors: 401 status
- Validation errors: 400 status
- Server errors: 500 status
- User already exists: 400 status (signup)
- Invalid credentials: 401 status (login)

## Notes

- All timestamps are automatically managed by Prisma (`@default(now())`, `@updatedAt`)
- UUIDs are used for all primary keys
- Transfer transactions don't require a categoryId
- Budgets are tied to specific months and categories
- Analytics endpoints require month and year query parameters
