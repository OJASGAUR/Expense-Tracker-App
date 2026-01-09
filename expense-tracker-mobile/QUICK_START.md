# Quick Start Guide - Expense Tracker Mobile

## Prerequisites

1. **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
2. **Android Studio** with Android SDK and Emulator set up
3. **Backend Server** running on `http://localhost:3000`

## Step-by-Step Setup

### 1. Install Dependencies

```bash
cd expense-tracker-mobile
npm install
```

### 2. Start Backend Server

Make sure your backend is running:

```bash
cd ../expense-tracker-backend
npm start
```

The backend should be running on `http://localhost:3000`

### 3. Start Android Emulator

1. Open Android Studio
2. Open AVD Manager (Tools → AVD Manager)
3. Start an Android emulator (or create one if you don't have one)

### 4. Start Expo Development Server

```bash
cd expense-tracker-mobile
npm start
```

This will:
- Start the Metro bundler
- Show a QR code
- Display options to open on different platforms

### 5. Run on Android Emulator

Once the Expo server is running, press `a` in the terminal, or run:

```bash
npm run android
```

The app will:
- Build and install on the emulator
- Open automatically
- Hot reload when you make changes

## First Time Setup

1. **Create an account**: When the app opens, tap "Sign up" to create a new account
2. **Add an account**: Go to Accounts tab and add your first financial account
3. **Add categories**: Go to Categories tab and add income/expense categories
4. **Add transactions**: Go to Transactions tab and start tracking!

## Troubleshooting

### "Unable to connect to server" error

- Make sure backend is running on `http://localhost:3000`
- For Android emulator, the app uses `http://10.0.2.2:3000/api` (automatically configured)
- Check that CORS is enabled on backend

### Metro bundler issues

```bash
# Clear cache and restart
expo start -c
```

### Android emulator not detected

```bash
# Check if emulator is running
adb devices

# If not listed, restart Android Studio and emulator
```

### Port already in use

```bash
# Kill process on port 8081 (Metro bundler default)
npx kill-port 8081
```

## API Configuration

The app is pre-configured for Android emulator:
- API URL: `http://10.0.2.2:3000/api`

For physical devices, you may need to update `src/utils/api.js`:
- Replace `10.0.2.2` with your computer's IP address
- Example: `http://192.168.1.100:3000/api`

## Development Tips

- **Hot Reload**: Changes automatically reload in the app
- **Debug Menu**: Shake device or press `Cmd+M` (iOS) / `Cmd+D` (Android) in emulator
- **Reload**: Press `r` in the Expo terminal to reload
- **Clear Cache**: Press `Shift+R` in the Expo terminal

## Next Steps

1. Test all features: Login, Signup, Accounts, Categories, Transactions, Budgets, Analytics
2. Customize the UI colors in `src/styles/global.js`
3. Add more features as needed
4. Build for production when ready

Enjoy your Expense Tracker mobile app! 🎉
