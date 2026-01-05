import { useEffect } from "react";
import { View } from "react-native";
import { ToastProvider, useToast } from "react-native-toast-notifications";
import AppNavigation from "../navigations/AppNavigation";
import { initializeToast } from "../utils/alerts";
import useAuthStore from "../stores/authStore";

function RootNavigator() {
  const toast = useToast();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (toast) {
        initializeToast(toast);
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [toast]);

  return <AppNavigation />;
}

export default function Index() {
  return (
    <ToastProvider
      placement="top"
      duration={3000}
      normalColor="#2196F3"
      successColor="#4CAF50"
      dangerColor="#F44336"
      warningColor="#FF9800"
    >
      <View style={{ flex: 1 }}>
        <RootNavigator />
      </View>
    </ToastProvider>
  );
}
