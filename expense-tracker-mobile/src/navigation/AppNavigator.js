import React from 'react';
import { View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import ThemeToggle from '../components/ThemeToggle';
import LogoutButton from '../components/LogoutButton';
import SplashScreen from '../components/SplashScreen';

// Screens
import LoginScreen from '../screens/Login';
import SignupScreen from '../screens/Signup';
import DashboardScreen from '../screens/Dashboard';
import AccountsScreen from '../screens/Accounts';
import CategoriesScreen from '../screens/Categories';
import TransactionsScreen from '../screens/Transactions';
import BudgetsScreen from '../screens/Budgets';
import AnalyticsScreen from '../screens/Analytics';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  const { colors } = useTheme();
    
    return (
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === 'Dashboard') {
              iconName = focused ? 'home' : 'home-outline';
            } else if (route.name === 'Accounts') {
              iconName = focused ? 'wallet' : 'wallet-outline';
            } else if (route.name === 'Categories') {
              iconName = focused ? 'pricetag' : 'pricetag-outline';
            } else if (route.name === 'Transactions') {
              iconName = focused ? 'receipt' : 'receipt-outline';
            } else if (route.name === 'Budgets') {
              iconName = focused ? 'flag' : 'flag-outline';
            } else if (route.name === 'Analytics') {
              iconName = focused ? 'bar-chart' : 'bar-chart-outline';
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.gray,
          tabBarStyle: {
            backgroundColor: colors.card,
            borderTopColor: colors.border,
          },
        headerShown: true,
        header: ({ options, route }) => {
          const title = options.title || route.name;
          return (
            <View style={{ backgroundColor: '#0ea5e9', paddingTop: 40, paddingBottom: 12, paddingHorizontal: 16, height: 80 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#ffffff' }}>{title}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <React.Suspense fallback={<View style={{ width: 44, height: 44 }} />}>
                    <LogoutButton />
                    <ThemeToggle />
                  </React.Suspense>
                </View>
              </View>
            </View>
          );
        },
          headerTitle: '',
          headerStyle: {
            backgroundColor: '#0ea5e9',
            height: 80,
          },
          headerTintColor: '#ffffff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        })}
      >
        <Tab.Screen name="Dashboard" component={DashboardScreen} />
        <Tab.Screen name="Accounts" component={AccountsScreen} />
        <Tab.Screen name="Categories" component={CategoriesScreen} />
        <Tab.Screen name="Transactions" component={TransactionsScreen} />
        <Tab.Screen name="Budgets" component={BudgetsScreen} />
        <Tab.Screen name="Analytics" component={AnalyticsScreen} />
      </Tab.Navigator>
    );
}

export default function AppNavigator() {
  const { user, loading } = useAuth();
  const { colors } = useTheme();
  const [showSplash, setShowSplash] = React.useState(true);
  const [minSplashTime] = React.useState(Date.now());

  React.useEffect(() => {
    if (!loading) {
      // Ensure splash screen shows for at least 2.5 seconds
      const elapsed = Date.now() - minSplashTime;
      const remaining = Math.max(0, 2500 - elapsed);
      
      setTimeout(() => {
        setShowSplash(false);
      }, remaining);
    }
  }, [loading, minSplashTime]);

  if (loading || showSplash) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer
      theme={{
        dark: false,
        colors: {
          primary: colors.primary,
          background: colors.background,
          card: colors.card,
          text: colors.text,
          border: colors.border,
          notification: colors.primary,
        },
      }}
    >
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <Stack.Screen name="Main" component={MainTabs} />
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Signup" component={SignupScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
