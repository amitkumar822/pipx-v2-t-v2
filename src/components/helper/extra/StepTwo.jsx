import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TextInput, KeyboardAvoidingView, Platform } from "react-native";
import { AuthHeader } from "../auth/AuthHeader";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useUserProvider } from "@/src/context/user/userContext";
import Buttons from "../../user_details/helper/Buttons";
import Toast from "react-native-toast-message";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import apiService from "@/src/services/api";

export const StepTwo = ({ type, step, setStep }) => {
  const { otpEmail, email_or_mobile } = useUserProvider();

  const [otp, setOtp] = useState("");

  useEffect(() => {
    setOtp(otpEmail);
  }, [otpEmail]);

  const [loading, setLoading] = useState(false);

  const handleOtpVerify = async () => {
    if (!otp) {
      Toast.show({
        type: "info",
        text1: "Information",
        text2: "Please enter otp number",
      });
      return;
    }

    setLoading(true);
    try {
      // Assuming apiService.verifyOtp is available and returns a promise
      const response = await apiService.verifyOtp({
        otp,
        email_or_mobile: email_or_mobile?.toLowerCase().trim(),
      });

      if (response?.statusCode === 200 || response?.data) {
        Toast.show({
          type: "success",
          text1: "OTP Verified Successfully!",
          text2: "Your OTP verification is completed.",
        });

        setOtp("");
        if (type === "forgotpassword") {
          setStep(4);
        } else {
          setStep(3);
        }
      }
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Failed to verify OTP",
        text2:
          error?.response?.data?.message ||
          error.message ||
          "An error occurred",
      });
    } finally {
      setLoading(false);
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
            <Ionicons name="send" size={40} color="#D7D7D7" />
          </View>
          <View style={styles.mailtitle}>
            {type === "signup" || type === "forgotpassword" ? (
              <Text style={styles.mailtitletxt}>
                Confirm your email address
              </Text>
            ) : (
              <Text></Text>
            )}
          </View>
          <View style={styles.mailsubtitle}>
            {type === "signup" || type === "forgotpassword" ? (
              <Text style={styles.mailsubtitletxt}>
                Enter the OTP sent to {email_or_mobile}
              </Text>
            ) : (
              <Text></Text>
            )}
          </View>
          <View style={styles.emailinputwrap}>
            <TextInput
              style={styles.emailinput}
              onChangeText={(text) => setOtp(text)}
              value={otp}
              placeholder="OTP"
              keyboardType="numeric"
            />
          </View>
          {type === "signup" ? <View></View> : <></>}
        </View>
      </View>

      <View style={styles.bottomsection}>
        <Buttons onPress={handleOtpVerify} isLoading={loading} />
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
    gap: 12,
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
});
