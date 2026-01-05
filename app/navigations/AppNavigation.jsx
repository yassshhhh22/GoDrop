import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import LoginScreen from "../screens/Login";
import VerifyOTPScreen from "../screens/VerifyOTP";
import CartScreen from "../screens/tabs/CartScreen";
import CategoriesScreen from "../screens/tabs/CategoriesScreen";
import HomeScreen from "../screens/tabs/HomeScreen";
import ProfileScreen from "../screens/tabs/ProfileScreen";
import useAuthStore from "../stores/authStore";
import useConfigStore from "../stores/configStore";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function HomeTabs() {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#3dba49ff",
        tabBarInactiveTintColor: "#9AA4B2",
        tabBarShowLabel: true,
        tabBarStyle: {
          height: 64,
          paddingBottom: 8,
          paddingTop: 6,
          backgroundColor: "#fafad0ff",
          borderTopWidth: 0,
          elevation: 6,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "home" : "home-outline"}
              size={size ?? 24}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Categories"
        component={CategoriesScreen}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "grid" : "grid-outline"}
              size={size ?? 24}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Cart"
        component={CartScreen}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "cart" : "cart-outline"}
              size={size ?? 24}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "person" : "person-outline"}
              size={size ?? 24}
              color={color}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

/**
 * Splash/Loading screen while checking auth
 */
function SplashScreen() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator size="large" color="#3dba49ff" />
    </View>
  );
}

const AppNavigation = () => {
  const { isAuthenticated } = useAuthStore();
  const { fetchAllConfig } = useConfigStore();
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const initApp = async () => {
      try {
        await fetchAllConfig();
      } catch (error) {
      } finally {
        setInitializing(false);
      }
    };
    initApp();
  }, []);

  if (initializing) {
    return <SplashScreen />;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <Stack.Screen name="HomeTabs" component={HomeTabs} />
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="VerifyOTP" component={VerifyOTPScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};

export default AppNavigation;
