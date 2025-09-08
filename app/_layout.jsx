import React, { useEffect, useState } from "react";
import { Slot, Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import "../global.css";
import Toast from "react-native-toast-message";
import { Text, View, LogBox } from "react-native";
import { applyPatches } from "@/src/patches/react-native-css-interop-patch";
import AppErrorHandler from "@/src/components/AppErrorHandler";
import { SafeAreaProviderFix } from "@/src/components/SafeAreaProviderFix";
import { StripeProvider } from "@stripe/stripe-react-native";
import { UserContextProvider } from "@/src/context/user/userContext";
import { ErrorBoundary } from "@/src/components/ErrorBoundary";
import { AuthContextProvider } from "@/src/store/AuthContext";
import ENV from "@/src/config/env";

// Apply patches to fix third-party library issues
try {
  applyPatches();
} catch (error) {
  console.warn("Failed to apply patches:", error);
}

// Ignore specific errors related to React Native view tags
LogBox.ignoreLogs([
  "Unable to find viewState for tag",
  "Surface stopped: false",
  "Tried to get frame for out of range index",
  "Can't perform a React state update on an unmounted component",
]);

// Ignore specific warnings that might be causing issues
LogBox.ignoreLogs([
  "ViewPropTypes will be removed from React Native",
  "ColorPropType will be removed",
  "Failed to call maybeHijackSafeAreaProvider",
  "Require cycle:",
  "Non-serializable values were found in the navigation state",
]);

// Keep the splash screen visible until we're ready to render
SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  // Use state to track initialization status
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize app with error handling
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Wait for a moment to ensure all components are initialized
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Mark as initialized
        setIsInitialized(true);

        // Hide splash screen
        try {
          await SplashScreen.hideAsync();
        } catch (splashError) {
          console.warn("Error hiding splash screen:", splashError);
          // Continue even if splash screen fails
        }
      } catch (e) {
        console.error("Error during app initialization:", e);
        // Mark as initialized anyway to prevent hanging
        setIsInitialized(true);
      }
    };

    initializeApp();
  }, []);

  // Wrap everything in our custom error handler
  return (
    <AuthContextProvider>
      <AppErrorHandler>
        <View style={{ flex: 1 }}>
          <ErrorBoundary
            fallback={({ error }) => (
              <View style={{ flex: 1, padding: 20 }}>
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "bold",
                    marginBottom: 10,
                  }}
                >
                  Something went wrong
                </Text>
                <Text style={{ marginBottom: 20 }}>
                  The app encountered an error but you can still use it.
                </Text>
                <Text style={{ fontSize: 12, color: "gray" }}>
                  Error details: {error?.message || "Unknown error"}
                </Text>
              </View>
            )}
            onError={(error, errorInfo) => {
              console.error("Root error boundary caught:", error, errorInfo);
            }}
          >
            <SafeAreaProviderFix>
              <ErrorBoundary>
                <StripeProviderSafe>
                  <ErrorBoundary>
                    <ErrorBoundary>
                      <UserContextProvider>
                        <Slot />
                        <Toast
                          visibilityTime={3000} // 3 seconds
                        />
                      </UserContextProvider>
                    </ErrorBoundary>
                  </ErrorBoundary>
                </StripeProviderSafe>
              </ErrorBoundary>
            </SafeAreaProviderFix>
          </ErrorBoundary>
        </View>
      </AppErrorHandler>
    </AuthContextProvider>
  );
}

// Safe wrapper for StripeProvider to prevent crashes
function StripeProviderSafe({ children }) {
  try {
    return (
      <ErrorBoundary
        fallback={
          <View style={{ flex: 1 }}>
            <Text style={{ padding: 20, fontSize: 16 }}>
              Payment system unavailable. Other features should still work.
            </Text>
            {children}
          </View>
        }
      >
        <StripeProvider
          publishableKey={ENV.STRIPE.PUBLISHABLE_KEY}
          merchantIdentifier={ENV.STRIPE.MERCHANT_IDENTIFIER}
        >
          {children}
        </StripeProvider>
      </ErrorBoundary>
    );
  } catch (error) {
    console.error("Error initializing StripeProvider:", error);
    return <View style={{ flex: 1 }}>{children}</View>;
  }
}
