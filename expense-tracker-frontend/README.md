# Expense Tracker Frontend

A modern, beautiful React frontend for the Expense Tracker application built with Vite, React, Tailwind CSS, and Recharts.

## Features

- 🎨 **Beautiful UI** - Modern, responsive design with Tailwind CSS
- 🔐 **Authentication** - Login and signup with JWT token management
- 💰 **Account Management** - Create and manage multiple accounts with balance tracking
- 📁 **Category Management** - Organize income and expense categories
- 💳 **Transaction Tracking** - Record income, expenses, and transfers
- 🎯 **Budget Management** - Set monthly budgets and track spending
- 📊 **Analytics** - Visualize financial data with charts and graphs
- 📱 **Responsive Design** - Works seamlessly on desktop, tablet, and mobile

## Tech Stack

- **React 18** - UI library
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Recharts** - Chart library
- **Lucide React** - Icon library
- **date-fns** - Date utility library

## Getting Started

### Prerequisites

- Node.js 16+ and npm
- Backend server running on `http://localhost:3000`

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file (optional):
```env
VITE_API_URL=http://localhost:3000/api
```

3. Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Project Structure

```
expense-tracker-frontend/
├── src/
│   ├── components/       # Reusable components
│   │   ├── Layout.jsx    # Main layout with sidebar
│   │   └── ProtectedRoute.jsx
│   ├── context/          # React context
│   │   └── AuthContext.jsx
│   ├── pages/            # Page components
│   │   ├── Login.jsx
│   │   ├── Signup.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Accounts.jsx
│   │   ├── Categories.jsx
│   │   ├── Transactions.jsx
│   │   ├── Budgets.jsx
│   │   └── Analytics.jsx
│   ├── utils/            # Utility functions
│   │   └── api.js        # API client
│   ├── App.jsx           # Main app component
│   ├── main.jsx          # Entry point
│   └── index.css         # Global styles
├── index.html
├── package.json
├── vite.config.js
└── tailwind.config.js
```

## Features Overview

### Dashboard
- Overview of financial stats
- Recent transactions
- Quick access to all features

### Accounts
- Create accounts with custom icons
- View account balances
- Delete accounts (soft delete)

### Categories
- Separate income and expense categories
- Custom icons for each category
- Organize transactions by category

### Transactions
- Add income, expense, or transfer transactions
- Filter by transaction type
- View transaction history
- Link transactions to accounts and categories

### Budgets
- Set monthly budgets by category
- Track spending vs budget
- Visual progress indicators
- Month/year selection

### Analytics
- Expense breakdown by category (pie chart)
- Account analysis (bar chart)
- Income vs expense comparison
- Monthly summaries

## API Integration

The frontend communicates with the backend API through the `api.js` utility which:
- Handles authentication tokens
- Manages API base URL
- Intercepts requests/responses
- Handles errors and redirects

## Styling

The app uses Tailwind CSS with custom configuration:
- Primary color scheme (blue)
- Custom utility classes in `index.css`
- Responsive design patterns
- Consistent spacing and typography

## Development

- Hot module replacement (HMR) enabled
- Proxy configured for API calls
- ESLint and Prettier recommended

## License

MIT
