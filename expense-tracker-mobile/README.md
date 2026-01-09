# Expense Tracker Mobile (Expo)

A React Native mobile application for the Expense Tracker built with Expo, React Navigation, and React Native Chart Kit.

## Features

- 📱 **Native Mobile App** - Built with React Native and Expo
- 🔐 **Authentication** - Login and signup with JWT token management
- 💰 **Account Management** - Create and manage multiple accounts with balance tracking
- 📁 **Category Management** - Organize income and expense categories
- 💳 **Transaction Tracking** - Record income, expenses, and transfers
- 🎯 **Budget Management** - Set monthly budgets and track spending
- 📊 **Analytics** - Visualize financial data with charts and graphs
- 📱 **Android & iOS** - Works on both platforms

## Prerequisites

- Node.js 16+ and npm
- Expo CLI (`npm install -g expo-cli` or use `npx`)
- Android Studio (for Android emulator)
- Backend server running on `http://localhost:3000`

## Installation

1. Install dependencies:
```bash
cd expense-tracker-mobile
npm install
```

2. Make sure your backend is running on `http://localhost:3000`

3. For Android emulator, the API URL is already configured to use `http://10.0.2.2:3000/api` (which maps to localhost on the host machine)

## Running the App

### Start the Expo development server:
```bash
npm start
# or
expo start
```

### Run on Android Emulator:
1. Make sure Android Studio emulator is running
2. Press `a` in the Expo CLI terminal, or run:
```bash
npm run android
# or
expo start --android
```

### Run on iOS Simulator (Mac only):
```bash
npm run ios
# or
expo start --ios
```

### Run on Physical Device:
1. Install Expo Go app from App Store (iOS) or Play Store (Android)
2. Scan the QR code shown in the terminal
3. Make sure your phone and computer are on the same network

## Project Structure

```
expense-tracker-mobile/
├── App.js                 # Main app entry point
├── src/
│   ├── screens/          # Screen components
│   │   ├── Login.js
│   │   ├── Signup.js
│   │   ├── Dashboard.js
│   │   ├── Accounts.js
│   │   ├── Categories.js
│   │   ├── Transactions.js
│   │   ├── Budgets.js
│   │   └── Analytics.js
│   ├── navigation/       # Navigation setup
│   │   └── AppNavigator.js
│   ├── context/         # React context
│   │   └── AuthContext.jsx
│   ├── utils/           # Utility functions
│   │   └── api.js       # API client
│   └── styles/          # Global styles
│       └── global.js
├── package.json
└── app.json             # Expo configuration
```

## API Configuration

The app is configured to connect to the backend API. For Android emulator:
- Uses `http://10.0.2.2:3000/api` (maps to localhost)

For iOS simulator or physical device:
- You may need to update `src/utils/api.js` to use your computer's IP address
- Example: `http://192.168.1.100:3000/api`

## Key Dependencies

- **expo** - Expo framework
- **react-native** - React Native core
- **@react-navigation/native** - Navigation library
- **axios** - HTTP client
- **@expo/vector-icons** - Icon library
- **react-native-chart-kit** - Chart library
- **@react-native-async-storage/async-storage** - Local storage

## Building for Production

### Android APK:
```bash
expo build:android
```

### iOS IPA:
```bash
expo build:ios
```

## Troubleshooting

### Android Emulator Connection Issues:
- Make sure the emulator is running before starting Expo
- Verify backend is accessible at `http://10.0.2.2:3000` from the emulator
- Check that CORS is enabled on the backend

### API Connection Issues:
- For physical devices, update the API URL in `src/utils/api.js` to use your computer's IP address
- Make sure your phone and computer are on the same Wi-Fi network
- Check firewall settings

### Metro Bundler Issues:
```bash
# Clear cache and restart
expo start -c
```

## License

MIT
