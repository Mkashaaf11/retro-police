import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useEffect, useState } from "react";
import { FIREBASE_AUTH } from "./FirebaseConfig";
import { Alert } from "react-native";
import { onAuthStateChanged, User } from "firebase/auth";
import { DefaultTheme } from "react-native-paper";
import { registerRootComponent } from "expo";
import React from "react";

// Import your screens
import Login from "./app/screens/Login";
import Dashboard from "./app/screens/Dashboard";
import Updates from "./app/screens/Updates";
import Profile from "./app/screens/Profile";
import ProfileInfo from "./app/screens/ProfileInfo"; // Add ProfileInfo screen
import { PaperProvider } from "react-native-paper";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Tab Navigator (for logged-in users)
function TabNav() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Dashboard" component={Dashboard} />
      <Tab.Screen name="Updates" component={Updates} />
      <Tab.Screen name="Profile" component={Profile} />
    </Tab.Navigator>
  );
}

// Authentication Stack (for login/signup flow)
function AuthStack() {
  return (
    <Stack.Navigator initialRouteName="Login">
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="ProfileInfo" component={ProfileInfo} />
    </Stack.Navigator>
  );
}

const theme = {
  ...DefaultTheme,
  dark: false, // Set to 'false' for light mode (you can toggle between dark and light modes)
  colors: {
    ...DefaultTheme.colors,
    primary: "#6dbf44", // Shopify Green
    background: "#f7f7f7", // Light gray background for a clean look
    surface: "#ffffff", // White background for surfaces (cards, buttons, etc.)
    text: "#333333", // Dark text for readability
    placeholder: "#888888", // Lighter placeholder text color
    accent: "#6dbf44", // Accent color for buttons and highlights
    error: "#ff5252", // Red for error text
    onSurface: "#333333", // Text on surfaces (card texts, etc.)
  },
};
// Main App Component
export default function App() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    onAuthStateChanged(FIREBASE_AUTH, (user) => {
      if (user) {
        if (user.emailVerified) {
          setUser(user);
        } else {
          Alert.alert(
            "Email Verification Required",
            "Please verify your email before accessing the full app."
          );
          FIREBASE_AUTH.signOut(); // Sign out unverified users
          setUser(null);
        }
      } else {
        setUser(null);
      }
    });
  }, []);

  return (
    <PaperProvider theme={theme}>
      <NavigationContainer>
        {user ? (
          <TabNav /> // Show Tab Navigation if user is authenticated
        ) : (
          <AuthStack /> // Show Login/Signup stack if user is not authenticated
        )}
      </NavigationContainer>
    </PaperProvider>
  );
}

registerRootComponent(App);
