# Expense Tracker Application  
Drive Link : https://drive.google.com/drive/folders/1euEVXcSVxZkaCLXbx5fGk10sYDAAlf-C?usp=drive_link

A full-stack expense tracking application built with React (Web), React Native (Mobile), and Node.js/Express (Backend). The application helps users manage their finances by tracking expenses, income, budgets, and providing detailed analytics with graphical representations.

## 📋 Feature Checklist

| Feature | Status | Description |
|---------|--------|-------------|
| **List All Expenses with Details** | ✅ Implemented | View all transactions with amount, type, category, account, date, and notes |
| **Category-wise Spending Data** | ✅ Implemented | Analyze expenses grouped by categories with detailed breakdowns |
| **Total Spending Data** | ✅ Implemented | Calculate and display total income, expenses, and net balance |
| **Local Storage for Adding/Deleting Data** | ✅ Implemented | Data persistence using AsyncStorage (mobile) and database (all platforms) |
| **Database Storage (Bonus)** | ✅ Implemented | PostgreSQL database with Prisma ORM for robust data management |
| **Light/Dark Mode (Bonus)** | ✅ Implemented | Theme toggle with animated sun/moon icon, fully adaptive UI |
| **Graphical Representation (Bonus)** | ✅ Implemented | Pie charts, bar charts, and visual analytics for financial data |

## 🏗️ Architecture Overview

The application follows a **three-tier architecture**:

1. **Frontend (Web)**: React application with Vite, Tailwind CSS, and Recharts
2. **Mobile App**: React Native application with Expo and React Navigation
3. **Backend API**: Node.js/Express RESTful API with PostgreSQL database

## 🗄️ Database Architecture

### Technology Stack
- **Database**: PostgreSQL (relational database)
- **ORM**: Prisma (type-safe database client)
- **Storage Method**: Persistent database storage (not local storage)

### Database Schema

The application uses **5 main models** in PostgreSQL:

#### 1. **User Model**
- Stores user authentication credentials
- Links to all user-specific data (accounts, categories, transactions, budgets)
- Fields: `id`, `email`, `password`, `createdAt`

#### 2. **Account Model**
- Represents financial accounts (Wallet, Bank, Cash, etc.)
- Supports custom icons and names
- Implements soft delete (`isDeleted` flag)
- Fields: `id`, `name`, `icon`, `userId`, `isDeleted`, `createdAt`, `updatedAt`

#### 3. **Category Model**
- Organizes transactions into income/expense categories
- Supports custom icons for visual organization
- Type field distinguishes between income and expense categories
- Fields: `id`, `name`, `icon`, `type`, `userId`, `isDeleted`, `createdAt`, `updatedAt`

#### 4. **Transaction Model**
- Core model storing all financial transactions
- Supports three types: `income`, `expense`, `transfer`
- Links to accounts and categories
- Transfer transactions use `transferGroupId` to link related transactions
- Fields: `id`, `amount`, `type`, `note`, `accountId`, `categoryId`, `transferGroupId`, `userId`, `isDeleted`, `createdAt`, `updatedAt`

#### 5. **Budget Model**
- Stores monthly budgets by category
- Tracks spending limits for specific months/years
- Fields: `id`, `amount`, `month`, `year`, `categoryId`, `userId`, `isDeleted`, `createdAt`, `updatedAt`

### Database Operations

#### Adding Data
- **Create Operations**: All create operations (accounts, categories, transactions, budgets) use Prisma's `create()` method
- **Example**: When creating a transaction, data is inserted into PostgreSQL via Prisma ORM
- **Validation**: Server-side validation ensures data integrity before database insertion

#### Deleting Data
- **Soft Delete Pattern**: Instead of hard deletion, records are marked with `isDeleted: true`
- **Benefits**: 
  - Preserves data history
  - Allows recovery if needed
  - Maintains referential integrity
- **Implementation**: All delete operations use `update()` to set `isDeleted: true`

#### Querying Data
- **Filtering**: All queries filter by `userId` (multi-user support) and `isDeleted: false`
- **Relations**: Prisma automatically handles joins between related models (e.g., transaction → account, category)
- **Aggregations**: Analytics use Prisma's `groupBy()` for category-wise spending calculations

### Data Flow Example

**Adding an Expense Transaction:**
1. User fills form in frontend/mobile app
2. Request sent to backend API: `POST /api/transactions`
3. Backend validates data (amount, account, category ownership)
4. Prisma creates record in PostgreSQL `Transaction` table
5. Response sent back to client
6. Client updates UI with new transaction

**Calculating Category-wise Spending:**
1. User navigates to Analytics page
2. Frontend requests: `GET /api/analytics/expense-by-category?month=1&year=2024`
3. Backend uses Prisma `groupBy()` to aggregate transactions by category
4. Returns grouped data with sums
5. Frontend renders pie chart using Recharts/React Native Chart Kit

## 🚀 How the Application Works

### 1. Authentication Flow
- Users register/login through the API
- JWT tokens are generated and stored
- All subsequent API requests include the token in headers
- Backend middleware validates tokens before processing requests

### 2. Expense Management Flow

#### Adding Expenses
- User selects account, category, amount, and optional note
- Transaction type can be: Income, Expense, or Transfer
- Data is validated and stored in PostgreSQL database
- Account balance is calculated dynamically based on transactions

#### Viewing Expenses
- All transactions are fetched from database
- Filtered by user ID and non-deleted records
- Displayed with full details: amount, category, account, date, notes
- Sorted by creation date (newest first)

#### Deleting Expenses
- Soft delete: Transaction marked as `isDeleted: true`
- Removed from UI but preserved in database
- Account balances recalculated automatically

### 3. Category-wise Analysis
- Backend aggregates transactions using Prisma `groupBy()`
- Groups by `categoryId` for selected month/year
- Returns sum of amounts per category
- Frontend visualizes with pie charts and bar charts

### 4. Total Spending Calculation
- **Total Income**: Sum of all `income` type transactions
- **Total Expense**: Sum of all `expense` type transactions
- **Net Balance**: Total Income - Total Expense
- **Account Balance**: Calculated from all transactions linked to account (including transfers)

### 5. Budget Tracking
- Users set monthly budgets per category
- System tracks spending against budget
- Visual progress bars show percentage spent
- Alerts when approaching or exceeding budget

### 6. Analytics & Visualization
- **Expense by Category**: Pie chart showing category-wise expense distribution
- **Income by Category**: Pie chart showing category-wise income distribution
- **Income vs Expense**: Bar chart comparing monthly income and expenses
- **Account Analysis**: Bar chart showing income, expense, and net per account

## 🎨 Light/Dark Mode Implementation

### Mobile App
- **Theme Context**: React Context API manages theme state
- **Persistent Storage**: Theme preference saved in AsyncStorage
- **Animated Toggle**: Sun/moon icon with rotation and scale animations
- **Adaptive UI**: All screens, buttons, text, and cards adapt to theme
- **System Preference**: Defaults to system theme if no preference saved

### Web App
- Theme support can be added similarly using React Context

## 📊 Graphical Representation

### Charts Used
1. **Pie Charts**: Category-wise expense/income breakdown
2. **Bar Charts**: Income vs Expense comparison, Account analysis
3. **Progress Bars**: Budget spending visualization

### Libraries
- **Web**: Recharts (React charting library)
- **Mobile**: React Native Chart Kit (mobile-optimized charts)

## 🔧 Technology Stack

### Backend
- Node.js + Express.js
- PostgreSQL (Database)
- Prisma ORM
- JWT Authentication
- bcrypt (Password Hashing)

### Frontend (Web)
- React 18
- Vite
- Tailwind CSS
- React Router
- Recharts
- Axios

### Mobile
- React Native
- Expo
- React Navigation
- React Native Chart Kit
- AsyncStorage
- Expo Linear Gradient

## 📦 Installation & Setup

### Prerequisites
- Node.js 16+
- PostgreSQL database
- npm or yarn

### Backend Setup
cd expense-tracker-backend
npm install

# Create .env file
DATABASE_URL="postgresql://user:password@localhost:5432/expense_tracker"
JWT_SECRET="your-secret-key"
PORT=3000

# Run migrations
npx prisma migrate dev

# Start server
npm run dev
