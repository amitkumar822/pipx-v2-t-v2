import { AuthContext } from "@/src/store/AuthContext";
import { Redirect } from "expo-router";
import { useContext } from "react";
import { ActivityIndicator, View } from "react-native";
import { TextInput } from "react-native";

// Fix placeholder + background globally
if (TextInput.defaultProps == null) {
  TextInput.defaultProps = {};
}

// Default background and placeholder color
TextInput.defaultProps.style = {
  backgroundColor: "#F5F5F5",
  paddingHorizontal: 12,
  paddingVertical: 8,
  borderRadius: 8,
};

TextInput.defaultProps.placeholderTextColor = "#666";

/**
 * ================================
 * Global TextInput Default Styling
 * ================================
 * - Disables system font scaling issues (if combined with allowFontScaling = false)
 * - Sets a consistent placeholder text color across the app
 * - Applies a default background color and text color to all TextInputs
 * - Can be overridden locally in individual TextInput components
 */
TextInput.defaultProps = TextInput.defaultProps || {};
TextInput.defaultProps.placeholderTextColor = "#9CA3AF"; // default placeholder color
TextInput.defaultProps.style = [
  TextInput.defaultProps.style,
  { backgroundColor: "#1a1a1a", color: "#FFFFFF" },
];

export default function Index() {
  const { isLoggedIn, isLoading } = useContext(AuthContext);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!isLoggedIn) {
    return <Redirect href="auth/login" />;
  } else {
    return <Redirect href="(tabs)" />;
  }
}
