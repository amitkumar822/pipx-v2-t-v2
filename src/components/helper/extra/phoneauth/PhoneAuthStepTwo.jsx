import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { AuthHeader } from "../../auth/AuthHeader";
import Ionicons from "@expo/vector-icons/Ionicons";
import Toast from "react-native-toast-message";
import { useUserProvider } from "@/src/context/user/userContext";
import Buttons from "@/src/components/user_details/helper/Buttons";
import apiService from "@/src/services/api";

export const PhoneAuthStepTwo = ({ type, step, setStep }) => {
  const { otp, email_or_mobile } = useUserProvider();

  const [number, onChangeNumber] = useState("");

  useEffect(() => {
    onChangeNumber(otp);
  }, [otp]);

  const [timer, setTimer] = useState(30);
  const [resendEnabled, setResendEnabled] = useState(false);

  // Start timer when component mounts
  useEffect(() => {
    setTimer(30);
    setResendEnabled(false);
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setResendEnabled(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Again Send OTP
  const handleResend = () => {
    if (!resendEnabled) return;
    // trigger OTP resend logic here
    setTimer(30);
    setResendEnabled(false);

    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setResendEnabled(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const [isLoading, setIsLoading] = useState(false);

  // OTP Verify handler
  const handleOtpVerify = async () => {
    if (!number) {
      Toast.show({
        type: "info",
        text1: "Information",
        text2: "Please enter otp number",
      });
      return;
    }

    const formData = {
      otp: number,
      email_or_mobile,
    };
    if (formData) {
      return;
    }

    try {
      const response = await apiService.verifyOtp(formData);
      setIsLoading(true);
      if (response && response.statusCode === 200) {
        onChangeNumber("");
        setStep(3);
      } else {
        Toast.show({
          type: "error",
          text1: response?.message || "Failed to verify OTP",
        });
      }
    } catch (err) {
      Toast.show({
        type: "error",
        text1:
          err?.response?.data?.message ||
          err?.message ||
          "Failed to verify OTP",
      });
    } finally {
      setIsLoading(false);
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
            <Ionicons
              name="shield-checkmark-outline"
              size={40}
              color="#D7D7D7"
            />
          </View>
          <View style={styles.mailtitle}>
            {type === "signup" ? (
              <Text style={styles.mailtitletxt}>Enter OTP</Text>
            ) : (
              <Text></Text>
            )}
          </View>
          <View style={styles.mailsubtitle}>
            {type === "signup" ? (
              <Text style={styles.mailsubtitletxt}>Enter the OTP sent to:</Text>
            ) : (
              <Text></Text>
            )}
          </View>
          <View style={styles.emailinputwrap}>
            <TextInput
              style={styles.emailinput}
              onChangeText={onChangeNumber}
              value={number}
              placeholder="OTP"
              keyboardType="numeric"
            />
          </View>

          {/* Re-send OTP functionality */}
          {/* <View style={styles.resendContainer}>
            <Text style={styles.normalText}>Didn't receive the OTP? </Text>

            {resendEnabled ? (
              <TouchableOpacity onPress={handleResend}>
                <Text style={[styles.resendText, { color: "#007BFF" }]}>
                  Send Again
                </Text>
              </TouchableOpacity>
            ) : (
              <>
                <Text style={styles.timerText}>
                  00:{timer < 10 ? `0${timer}` : timer}
                </Text>
              </>
            )}
          </View> */}
        </View>
      </View>
      <View style={styles.bottomsection}>
        <Buttons onPress={handleOtpVerify} isLoading={isLoading} />
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
  },
  emailinput: {
    width: "100%",
    backgroundColor: "#F3F3F3",
    height: 56,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 14,
    marginTop: 20,
    borderColor: "#007AFF",
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
  resendContainer: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  normalText: {
    color: "#333",
    fontSize: 14,
  },
  resendText: {
    color: "#007BFF",
    fontWeight: "600",
    fontSize: 14,
  },
  timerText: {
    color: "#007BFF",
    fontWeight: "600",
    fontSize: 14,
    backgroundColor: "#e0e5f0ff",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 4,
  },
});
