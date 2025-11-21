import { Stack } from "expo-router";
import { PaperProvider } from "react-native-paper";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { View, StyleSheet, StatusBar, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { darkTheme } from "../theme/theme";
import { dbService } from "../services/database";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes
    },
  },
});

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      await dbService.init();
      setIsReady(true);
    } catch (error) {
      console.error("Failed to initialize database:", error);
    }
  };

  if (!isReady) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <PaperProvider theme={darkTheme} >
        <SafeAreaView style={[styles.container, { backgroundColor: darkTheme.colors.background }]}>
          <StatusBar showHideTransition={"slide"} barStyle="light-content" backgroundColor={darkTheme.colors.background} />
          <Stack
            screenOptions={{
              headerStyle: {
                // backgroundColor: darkTheme.colors.primary,
              },
              headerShown: false,
              // headerTintColor: darkTheme.colors.onPrimary,
              headerTitleStyle: {
                fontWeight: "bold",
              },
              animation: Platform.select({
                android: "fade_from_bottom",
                ios: "default"
              }),
            }}
          >
            <Stack.Screen
              name="(main)"
            />
            <Stack.Screen
              name="(form)"
            />
          </Stack>
        </SafeAreaView>
      </PaperProvider>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
