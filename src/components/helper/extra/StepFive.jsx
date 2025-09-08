import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TextInput,
  Pressable,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { AuthHeader } from "../auth/AuthHeader";
import Feather from "@expo/vector-icons/Feather";
import { Ionicons } from "@expo/vector-icons";
import Buttons from "../../user_details/helper/Buttons";
import { useUserProvider } from "@/src/context/user/userContext";
import Toast from "react-native-toast-message";
import apiService from "@/src/services/api";
import { RFValue } from "react-native-responsive-fontsize";

export const StepFive = ({ type, step, setStep }) => {
  const { setConfirmPassword, userAgentPassword, email_or_mobile } =
    useUserProvider();

  const [showPassword, setShowPassword] = useState(false);
  const [confirm_password, setConfirm_password] = useState("");

  // Password rule validation
  const isLengthValid =
    confirm_password.length >= 8 && confirm_password.length <= 32;
  const hasUpper = /[A-Z]/.test(confirm_password);
  const hasLower = /[a-z]/.test(confirm_password);
  const hasNumber = /[0-9]/.test(confirm_password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(confirm_password);

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

  const onContinue = async () => {
    const passwordValid =
      isLengthValid && hasUpper && hasLower && hasNumber && hasSpecial;

    setLoading(true);
    if (!confirm_password || !passwordValid) {
      Alert.alert(
        "Invalid Password",
        "Please enter a valid password that meets all the requirements."
      );
      setLoading(false);
      return;
    }
    // Check if confirm password matches the original password
    if (confirm_password.trim() !== userAgentPassword.trim()) {
      Toast.show({
        type: "error",
        text1: "Password Mismatch",
        text2: "Confirm password does not match the original password.",
      });
      setLoading(false);
      return;
    }

    // Forgot password functionality
    if (type === "forgotpassword") {
      try {
        const response = await apiService.resetPassword({
          email: email_or_mobile?.toLowerCase().trim(),
          newPassword: confirm_password.trim(),
        });
        if (response?.statusCode === 200) {
          Toast.show({
            type: "success",
            text1: "Password Reset Successfully!",
            text2: "Your password has been reset successfully.",
          });
          router.replace("/success");
        }
      } catch (error) {
        Toast.show({
          type: "error",
          text1: "Failed to reset password",
          text2:
            error?.response?.data?.message ||
            error.message ||
            "An error occurred",
        });
      } finally {
        setLoading(false);
      }
      return;
    }

    setTimeout(() => {
      setConfirmPassword(confirm_password.trim());
      setLoading(false);
      setShowPassword("");
      setStep(6);
    }, 500);
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
              <Text style={styles.mailtitletxt}>Re-enter password</Text>
            ) : (
              <Text></Text>
            )}
          </View>
          <View style={styles.emailinputwrap}>
            <TextInput
              style={styles.emailinput}
              onChangeText={setConfirm_password}
              value={confirm_password}
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
            <></>
          )}
        </View>
      </View>
      <View style={styles.bottomsection}>
        <Buttons onPress={onContinue} isLoading={loading} />
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
  },
  topsection: {
    width: "100%",
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "flex-start",
    gap: 12,
    paddingTop: 40,
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
  mailsubtitletxt: {
    fontSize: 16,
    fontWeight: "400",
    lineHeight: 20,
    color: "#797979",
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
    borderRadius: 14,
    marginTop: 20,
    borderColor: "#007aff",
    borderWidth: 2,
    bordeRadius: 14,
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
});
