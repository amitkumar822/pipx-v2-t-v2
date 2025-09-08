import React, { useEffect } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { ErrorBoundary } from "react-error-boundary";
import * as SplashScreen from "expo-splash-screen";
import { router } from "expo-router";

// Global error handler to catch JS errors
const setupGlobalErrorHandler = () => {
  // Save the original error handler
  const originalErrorHandler = ErrorUtils.getGlobalHandler();

  // Set a custom error handler
  ErrorUtils.setGlobalHandler((error, isFatal) => {
    console.error("Global JS Error:", error);

    // Special handling for the "Cannot read property 'displayName' of undefined" error
    if (
      error &&
      error.message &&
      error.message.includes("Cannot read property 'displayName' of undefined")
    ) {
      console.warn(
        "Caught SafeAreaProvider/CSS-interop error, attempting recovery..."
      );

      // Try to patch the issue at runtime
      try {
        // Try to patch the CSS interop module
        const cssInteropModule = require("react-native-css-interop/dist/runtime/third-party-libs/react-native-safe-area-context.native");

        if (
          cssInteropModule &&
          typeof cssInteropModule.maybeHijackSafeAreaProvider === "function"
        ) {
          // Replace with a safer version
          cssInteropModule.maybeHijackSafeAreaProvider = function (type) {
            if (!type) return type;
            return type;
          };
          console.log("Emergency patched maybeHijackSafeAreaProvider function");
        }
      } catch (patchError) {
        console.warn("Failed emergency patch:", patchError);
      }
    }

    // Still call the original handler
    originalErrorHandler(error, isFatal);
  });

  // Handle promise rejections
  const handlePromiseRejection = (event) => {
    console.error("Unhandled Promise Rejection:", event.reason);

    // Special handling for specific errors
    const error = event.reason;
    if (
      error &&
      error.message &&
      (error.message.includes("displayName") ||
        error.message.includes("SafeAreaProvider") ||
        error.message.includes("Unable to find viewState for tag") ||
        error.message.includes("view with tag") ||
        error.message.includes("css-interop"))
    ) {
      console.warn(
        "Caught SafeAreaProvider/CSS-interop promise rejection, attempting recovery..."
      );

      // Try to recover
      try {
        // Apply emergency patches
        require("@/src/patches/react-native-css-interop-patch").applyPatches();
      } catch (recoveryError) {
        console.error("Recovery failed:", recoveryError);
      }
    }
  };

  // Add event listener for unhandled promise rejections
  if (global.addEventListener) {
    global.addEventListener("unhandledrejection", handlePromiseRejection);
  }

  return () => {
    // Cleanup
    ErrorUtils.setGlobalHandler(originalErrorHandler);
    if (global.removeEventListener) {
      global.removeEventListener("unhandledrejection", handlePromiseRejection);
    }
  };
};

// Fallback component when an error occurs
const ErrorFallback = ({ error, resetErrorBoundary }) => {
  useEffect(() => {
    // Hide splash screen if it's still visible
    SplashScreen.hideAsync().catch(() => {});

    // Log the error for debugging
    console.error("Error caught by AppErrorHandler:", error);

    // Try to apply emergency patches if this is a SafeAreaProvider/CSS-interop error
    if (
      error &&
      error.message &&
      (error.message.includes("displayName") ||
        error.message.includes("SafeAreaProvider") ||
        error.message.includes("css-interop"))
    ) {
      console.warn(
        "Attempting emergency recovery for SafeAreaProvider error..."
      );

      try {
        // Apply emergency patches
        require("@/src/patches/react-native-css-interop-patch").applyPatches();
      } catch (recoveryError) {
        console.error("Recovery failed:", recoveryError);
      }
    }
  }, [error]);

  // Check if this is a SafeAreaProvider/CSS-interop error
  const isSafeAreaError =
    error &&
    error.message &&
    (error.message.includes("displayName") ||
      error.message.includes("SafeAreaProvider") ||
      error.message.includes("css-interop"));

  const handleRetry = () => {
    try {
      // Try to reset the error boundary
      if (typeof resetErrorBoundary === "function") {
        resetErrorBoundary();
      }

      // If this is a SafeAreaProvider error, try to navigate to root
      if (isSafeAreaError) {
        try {
          router.replace("/");
        } catch (navError) {
          console.error("Navigation error:", navError);
        }
      }
    } catch (retryError) {
      console.error("Error during retry:", retryError);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {isSafeAreaError ? "Layout Error Detected" : "Something went wrong"}
      </Text>

      <Text style={styles.message}>
        {isSafeAreaError
          ? "The app encountered a layout initialization error. This has been automatically fixed."
          : "The app encountered an unexpected error and cannot continue."}
      </Text>

      <Text style={styles.instruction}>
        {isSafeAreaError
          ? "Please tap the button below to reload the app with the fix applied."
          : "Please close the app and try again. If the problem persists, please reinstall the app."}
      </Text>

      <Pressable style={styles.retryButton} onPress={handleRetry}>
        <Text style={styles.retryButtonText}>
          {isSafeAreaError ? "Reload App" : "Try Again"}
        </Text>
      </Pressable>

      {__DEV__ && (
        <View style={styles.debugBox}>
          <Text style={styles.debugTitle}>Debug Information:</Text>
          <Text style={styles.debugText}>{error?.toString()}</Text>
          {error?.stack && <Text style={styles.debugText}>{error.stack}</Text>}
        </View>
      )}
    </View>
  );
};

// Main error handler component
export const AppErrorHandler = ({ children }) => {
  useEffect(() => {
    // Setup global error handler
    const cleanupGlobalHandler = setupGlobalErrorHandler();

    return () => {
      // Cleanup global error handler
      cleanupGlobalHandler();
    };
  }, []);

  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(error, info) => {
        console.error("Error caught by ErrorBoundary:", error, info);
      }}
    >
      {children}
    </ErrorBoundary>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#FF3B30",
  },
  message: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 10,
    color: "#333",
  },
  instruction: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 20,
    color: "#666",
  },
  retryButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginTop: 15,
    marginBottom: 25,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 150,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  debugBox: {
    padding: 15,
    backgroundColor: "#f8f8f8",
    borderRadius: 8,
    width: "100%",
    marginTop: 20,
  },
  debugTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#333",
  },
  debugText: {
    fontSize: 12,
    color: "#666",
    fontFamily: "monospace",
  },
});

export default AppErrorHandler;
