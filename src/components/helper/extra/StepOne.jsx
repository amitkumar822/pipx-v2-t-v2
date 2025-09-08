import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { AuthHeader } from "../auth/AuthHeader";
import Entypo from "@expo/vector-icons/Entypo";
import Buttons from "../../user_details/helper/Buttons";
import Toast from "react-native-toast-message";
import { useUserProvider } from "@/src/context/user/userContext";
import apiService from "@/src/services/api";

export const StepOne = ({ type, setStep, validateEmail }) => {
  const { setOtpEmail, setEmail_or_mobile } = useUserProvider();

  const [userEmail, setUserEmail] = useState("");
  const [showError, setShowError] = useState(false);
  const [errMsg, setErrMsg] = useState("");

  // login loading state management
  const [loading, setLoading] = useState(false);

  const onContinue = async () => {
    // Validate email format if it looks like an email
    const trimmedEmail = userEmail.toLocaleLowerCase().trim();
    const isEmail = trimmedEmail.includes("@");

    const isValidEmail = validateEmail(trimmedEmail) !== null;

    if (!isEmail && !isValidEmail) {
      setShowError(true);
      setErrMsg("Please enter your valide email");
      return;
    } else {
      setShowError(false);
      setErrMsg("");
    }

    if (type === "forgotpassword") {
      setLoading(true);
      try {
        const response = await apiService.forgotPassword(trimmedEmail);
        if (response?.statusCode === 200) {
          setEmail_or_mobile(trimmedEmail);
          setStep(2);
          Toast.show({
            type: "success",
            text1: "Reset OTP Sent Successfully!",
            text2: "Your reset OTP has been sent to your email.",
          });
        }
      } catch (error) {
        console.log("Error sending reset OTP:", JSON.stringify(error, null, 2));
        Toast.show({
          type: "error",
          text1: error?.message || "Failed to send reset otp",
        });
        setShowError(true);
        setErrMsg("Failed to send reset otp4444.");
      } finally {
        setLoading(false);
      }
      return;
    }

    const typeBaseRegLogin = type === "signup";

    if (typeBaseRegLogin) {
      //register part
      setLoading(true);
      try {
        const response = await apiService.generateOtpEmail({
          email: userEmail.toLocaleLowerCase().trim(),
        });
        Toast.show({
          type: "success",
          text1: "OTP Sent Successfully!",
          text2: "Your verification code has been sent to your email.",
        });
        setOtpEmail(response?.data?.otp);
        setEmail_or_mobile(userEmail.toLocaleLowerCase().trim());
        setStep(2);
      } catch (error) {
        Toast.show({
          type: "error",
          text1: error?.message || "Failed to generate OTP",
        });
        setShowError(true);
      } finally {
        setLoading(false);
      }
    } else {
      //login part
      setLoading(true);
      setTimeout(() => {
        setEmail_or_mobile(userEmail.toLocaleLowerCase().trim());
        setStep(4);
        setLoading(false);
      }, 500);

      return;
    }
  };

  return (
    <>
      <KeyboardAvoidingView
        style={{ flex: 1, paddingBottom: 10 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={20}
      >
        <View style={styles.mainsection}>
          <View style={styles.topsection}>
            {/* Back button */}
            <AuthHeader step={0} setStep={setStep} />

            <View style={styles.mailsign}>
              {type === "forgotpassword" ? (
                <Entypo name="lock" size={40} color="#D7D7D7" />
              ) : (
                <Entypo name="email" size={40} color="#D7D7D7" />
              )}
            </View>
            <View style={styles.mailtitle}>
              {type === "signup" ? (
                <Text style={styles.mailtitletxt}>Get going with email</Text>
              ) : type === "forgotpassword" ? (
                <Text style={styles.mailtitletxt}>Forgot your password?</Text>
              ) : (
                <Text style={styles.mailtitletxt}>
                  Enter your username/email
                </Text>
              )}
            </View>
            <View style={styles.mailsubtitle}>
              {type === "signup" || type === "forgotpassword" ? (
                <Text style={styles.mailsubtitletxt}>Enter your email id</Text>
              ) : (
                <></>
              )}
            </View>
            <View style={styles.emailinputwrap}>
              <TextInput
                style={styles.emailinput}
                onChangeText={setUserEmail}
                value={userEmail}
                placeholder="Email address"
                keyboardType="email-address"
              />
            </View>
            {showError ? (
              <View style={styles.errmsg}>
                <Text style={styles.errmsgtxt}>{errMsg}</Text>
              </View>
            ) : (
              <></>
            )}
          </View>
        </View>
        <View style={styles.bottomsection}>
          <Buttons
            onPress={onContinue}
            title={type === "forgotpassword" ? "Reset Password" : "Continue"}
            isLoading={loading}
          />
        </View>
      </KeyboardAvoidingView>
    </>
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
  continuebtnDisabled: {
    opacity: 0.6,
  },
  errmsg: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    paddingHorizontal: 21,
  },
  errmsgtxt: {
    color: "red",
    fontSize: 16,
    fontWeight: "600",
  },
});
