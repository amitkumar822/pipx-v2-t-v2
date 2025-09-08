import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useLogin } from "../../hooks/useApi";
import { LoginRequest } from "../../services/api";

interface LoginFormProps {
  onSuccess?: () => void;
  onSwitchToRegister?: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onSuccess,
  onSwitchToRegister,
}) => {
  const [formData, setFormData] = useState<LoginRequest>({
    email: "",
    mobile: "",
    password: "",
  });
  const [loginType, setLoginType] = useState<"email" | "mobile">("email");

  const loginMutation = useLogin();

  const handleLogin = async () => {
    try {
      const loginData: LoginRequest = {
        password: formData.password,
      };

      if (loginType === "email") {
        if (!formData.email) {
          Alert.alert("Error", "Please enter your email");
          return;
        }
        loginData.email = formData.email;
      } else {
        if (!formData.mobile) {
          Alert.alert("Error", "Please enter your mobile number");
          return;
        }
        loginData.mobile = formData.mobile;
      }

      if (!formData.password) {
        Alert.alert("Error", "Please enter your password");
        return;
      }

      const response = await loginMutation.mutateAsync(loginData);

      if (response.statusCode === 200) {
        console.log("Login successful:", response);
        Alert.alert("Success", response.message);
        onSuccess?.();
      } else {
        Alert.alert("Error", response.message || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      Alert.alert("Error", "An error occurred during login");
    }
  };

  const updateFormData = (field: keyof LoginRequest, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>

      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            loginType === "email" && styles.activeToggle,
          ]}
          onPress={() => setLoginType("email")}
        >
          <Text
            style={[
              styles.toggleText,
              loginType === "email" && styles.activeToggleText,
            ]}
          >
            Email
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            loginType === "mobile" && styles.activeToggle,
          ]}
          onPress={() => setLoginType("mobile")}
        >
          <Text
            style={[
              styles.toggleText,
              loginType === "mobile" && styles.activeToggleText,
            ]}
          >
            Mobile
          </Text>
        </TouchableOpacity>
      </View>

      {loginType === "email" ? (
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={formData.email}
          onChangeText={(value) => updateFormData("email", value)}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      ) : (
        <TextInput
          style={styles.input}
          placeholder="Mobile Number"
          value={formData.mobile}
          onChangeText={(value) => updateFormData("mobile", value)}
          keyboardType="phone-pad"
        />
      )}

      <TextInput
        style={styles.input}
        placeholder="Password"
        value={formData.password}
        onChangeText={(value) => updateFormData("password", value)}
        secureTextEntry
      />

      <TouchableOpacity
        style={[
          styles.button,
          loginMutation.isPending && styles.buttonDisabled,
        ]}
        onPress={handleLogin}
        disabled={loginMutation.isPending}
      >
        {loginMutation.isPending ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Login</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={onSwitchToRegister}>
        <Text style={styles.linkText}>Don't have an account? Register</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 30,
    color: "#333",
  },
  toggleContainer: {
    flexDirection: "row",
    marginBottom: 20,
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
  },
  activeToggle: {
    backgroundColor: "#007bff",
  },
  toggleText: {
    color: "#666",
    fontWeight: "500",
  },
  activeToggleText: {
    color: "#fff",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  button: {
    backgroundColor: "#007bff",
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 15,
  },
  buttonDisabled: {
    backgroundColor: "#ccc",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  linkText: {
    textAlign: "center",
    color: "#007bff",
    fontSize: 16,
  },
});
