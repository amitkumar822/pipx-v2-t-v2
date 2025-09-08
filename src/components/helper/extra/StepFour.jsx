import { useRouter } from "expo-router";
import React, { useState, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  Alert,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { AuthHeader } from "../auth/AuthHeader";
import Feather from "@expo/vector-icons/Feather";
import { AuthContext } from "../../../store/AuthContext";
import Buttons from "../../user_details/helper/Buttons";
import { Ionicons } from "@expo/vector-icons";
import { useUserProvider } from "@/src/context/user/userContext";
import { useLogin } from "@/src/hooks/useApi";
import { RFValue } from "react-native-responsive-fontsize";

export const StepFour = ({ type, step, setStep, loginType }) => {
  const router = useRouter();

  const { setIsLoggedIn, setUserType } = useContext(AuthContext);

  const { setUserAgentPassword, email_or_mobile } = useUserProvider();

  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Password rule validation
  const isLengthValid = password.length >= 8 && password.length <= 32;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  // Rule render or display
  const renderRule = (ruleValid, text) => (
    <View style={styles.rule}>
      <Ionicons
        name="checkmark-sharp"
        size={RFValue(18)}
        color={ruleValid ? "#007AFF" : "#A7A7A7"}
        style={{ marginRight: 6, fontWeight: ruleValid ? "700" : "400" }}
      />
      <Text style={styles.ruleText}>{text}</Text>
    </View>
  );

  const [loading, setLoading] = useState(false);

  // useLogin hook to handle login
  const loginMutation = useLogin();

  const onContinue = async () => {
    const passwordValid =
      isLengthValid && hasUpper && hasLower && hasNumber && hasSpecial;

    if (
      !password ||
      (type === "signup" && !passwordValid) ||
      (type === "forgotpassword" && !passwordValid)
    ) {
      Alert.alert(
        "Invalid Password",
        "Please enter a valid password that meets all the requirements."
      );
      return;
    }

    // check role type login or signup
    const typeBaseRegLogin = type === "signup" || type === "forgotpassword";

    if (typeBaseRegLogin) {
      // register part
      setLoading(true);

      setTimeout(() => {
        setUserAgentPassword(password.trim());
        setLoading(false);
        setPassword("");
        setStep(5);
      }, 500);
      return;
    } else {
      // Prepare login data based on login type
      const loginWithPhone = {
        mobile: email_or_mobile,
        password: password,
      };

      const loginWithEmail = {
        email: email_or_mobile,
        password: password,
      };

      setLoading(true);

      // login part
      loginMutation.mutate(
        loginType === "email" ? loginWithEmail : loginWithPhone,
        {
          onSuccess: (data) => {
            setLoading(false);
            setPassword("");
            setUserType(data?.user_type || "USER");
            setIsLoggedIn(true);
            // navigate to home/dashboard screen
            router.replace("/(tabs)");
          },
          onError: (error) => {
            setLoading(false);
            Alert.alert(
              "Login Failed",
              error?.message || "Something went wrong"
            );
          },
        }
      );
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, paddingBottom: 10 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={20}
    >
      <View style={styles.mainsection}>
        <View style={styles.topsection}>
          {/* Back button */}
          <AuthHeader step={step - 1} setStep={setStep} />

          <View style={styles.mailsign}>
            <Feather name="lock" size={40} color="#D7D7D7" />
          </View>
          <View style={styles.mailtitle}>
            {type === "signup" || type === "forgotpassword" ? (
              <Text style={styles.mailtitletxt}>Create password</Text>
            ) : (
              <Text style={styles.mailtitletxt}>Enter Password</Text>
            )}
          </View>
          <View style={styles.emailinputwrap}>
            <TextInput
              style={styles.emailinput}
              onChangeText={setPassword}
              value={password}
              placeholder="password"
              keyboardType="default"
              secureTextEntry={showPassword ? false : true}
            />
            <View style={{ position: "absolute", right: 35, top: "45%" }}>
              {showPassword ? (
                <Pressable onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons name="eye-off-outline" size={26} color="#007aff" />
                </Pressable>
              ) : (
                <Pressable onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons name="eye-outline" size={26} color="#007aff" />
                </Pressable>
              )}
            </View>
          </View>

          {type === "signup" || type === "forgotpassword" ? (
            <View style={{ paddingLeft: 25 }}>
              <Text style={styles.rulesTitle}>Your password must include:</Text>

              {renderRule(isLengthValid, "8–32 characters long")}
              {renderRule(hasLower, "1 lowercase character (a–z)")}
              {renderRule(hasUpper, "1 uppercase character (A–Z)")}
              {renderRule(hasNumber, "1 number")}
              {renderRule(hasSpecial, "1 special character e.g. !@#$%")}
            </View>
          ) : (
            <View style={styles.forgotPassContainer}>
              <TouchableOpacity
                onPress={() => router.push("/auth/forgotpassword")}
              >
                <Text style={styles.forgotPassText}>Forgot Password?</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
      <View style={styles.bottomsection}>
        <Buttons
          onPress={onContinue}
          isLoading={loading || loginMutation.loading}
        />
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  mainsection: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    paddingTop: 40,
  },
  topsection: {
    width: "100%",
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "flex-start",
    gap: 9,
  },
  mailsign: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    paddingHorizontal: 21,
  },
  mailtitle: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    paddingHorizontal: 21,
  },
  mailtitletxt: {
    fontSize: 24,
    fontWeight: "700",
  },
  mailsubtitle: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    paddingHorizontal: 21,
  },
  emailinputwrap: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    paddingHorizontal: 21,
    position: "relative",
    marginTop: -10,
  },
  emailinput: {
    width: "100%",
    backgroundColor: "#F3F3F3",
    height: 56,
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginTop: 20,
    borderColor: "#007aff",
    borderWidth: 2,
    borderRadius: 14,
    fontSize: 16,
  },
  bottomsection: {
    width: "100%",
    flexDirection: "row",
    paddingHorizontal: 21,
  },
  continuebtn: {
    width: "100%",
    backgroundColor: "#007AFF",
    paddingVertical: 16,
    borderRadius: 14,
    marginTop: 20,
    borderColor: "#007AFF",
    borderWidth: 2,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  btntxt: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  continuebtnDisabled: {
    opacity: 0.6,
  },
  rulesTitle: {
    fontWeight: "600",
    marginBottom: 10,
  },
  rule: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 7,
  },
  ruleText: {
    fontSize: 14,
    color: "#666",
  },
  forgotPassContainer: {
    alignSelf: "flex-end",
    marginTop: 8,
    marginRight: 4,
    paddingHorizontal: 24,
  },
  forgotPassText: {
    color: "#007BFF",
    fontSize: 14,
    fontWeight: "500",
  },
});
