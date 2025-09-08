import React from "react";
import { View } from "react-native";

// Create a safe version of SafeAreaProvider that won't crash
let SafeAreaProvider;

// Patch the maybeHijackSafeAreaProvider function to prevent crashes
const patchCssInteropModule = () => {
  try {
    // Directly monkey patch the module
    const cssInteropModule = require("react-native-css-interop/dist/runtime/third-party-libs/react-native-safe-area-context.native");

    if (
      cssInteropModule &&
      typeof cssInteropModule.maybeHijackSafeAreaProvider === "function"
    ) {
      // Save the original function
      const originalFunction = cssInteropModule.maybeHijackSafeAreaProvider;

      // Replace with a safer version that handles undefined/null types
      cssInteropModule.maybeHijackSafeAreaProvider = function (type) {
        // Add null/undefined check to prevent "Cannot read property 'displayName' of undefined" error
        if (!type) {
          console.log(
            "SafeAreaProvider fix: Prevented crash on undefined type"
          );
          return type;
        }

        // Add type check to ensure type is an object with displayName or name properties
        if (typeof type !== "object" && typeof type !== "function") {
          // console.log('SafeAreaProvider fix: Type is not an object or function');
          return type;
        }

        try {
          return originalFunction(type);
        } catch (error) {
          console.warn("Error in maybeHijackSafeAreaProvider:", error);
          return type; // Return the original type if the function fails
        }
      };
    } else {
      console.warn(
        "maybeHijackSafeAreaProvider function not found or not a function"
      );
    }
  } catch (patchError) {
    console.warn("Failed to patch CSS interop module:", patchError);
  }
};

// Try to import the real SafeAreaProvider
try {
  // First patch the CSS interop module to prevent crashes
  patchCssInteropModule();

  // Now safely import the SafeAreaProvider
  const safeAreaContext = require("react-native-safe-area-context");
  SafeAreaProvider = safeAreaContext.SafeAreaProvider;
} catch (importError) {
  console.warn("Failed to import SafeAreaProvider:", importError);
  // Create a fallback component if import fails
  SafeAreaProvider = ({ children, ...props }) => (
    <View style={{ flex: 1 }} {...props}>
      {children}
    </View>
  );
}

// This component wraps the SafeAreaProvider to ensure it's properly initialized
export function SafeAreaProviderFix(props) {
  try {
    // Double-check that SafeAreaProvider is defined
    if (!SafeAreaProvider) {
      console.warn("SafeAreaProvider is not defined, using fallback");
      return <View style={{ flex: 1 }}>{props.children}</View>;
    }

    return <SafeAreaProvider {...props} />;
  } catch (error) {
    console.warn("Error rendering SafeAreaProvider:", error);
    return <View style={{ flex: 1 }}>{props.children}</View>;
  }
}
