import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { AuthHeader } from "../../auth/AuthHeader";
import Feather from "@expo/vector-icons/Feather";
import PhoneInput from "./PhoneInput";
import Toast from "react-native-toast-message";
import { useUserProvider } from "@/src/context/user/userContext";
import Buttons from "@/src/components/user_details/helper/Buttons";
import apiService from "@/src/services/api";

export const PhoneAuthStepOne = ({ type, setStep }) => {
  const { setOtp, setEmail_or_mobile } = useUserProvider();

  const [mobile, onChangeMobile] = useState("");
  const [countryDetails, setCountryDetails] = useState({
    cca2: "GB",
    callingCode: ["44"],
  });

  // login loading state manage
  const [loading, setLoading] = useState(false);

  const handlePhoneSubmit = async () => {
    let mobileCompleteData = {
      mobile,
      country_code: countryDetails?.callingCode?.[0],
      country_flag: countryDetails?.cca2,
    };

    if (!mobileCompleteData) {
      Toast.show({
        type: "info",
        text1: "Information",
        text2: "Please enter phone number and country code.",
      });
      return;
    }

    const typeBaseRegLogin = type === "signup";

    if (typeBaseRegLogin) {
      //register part

      try {
        setLoading(true);
        const response = await apiService.generateOtp(mobileCompleteData);

        if (response.statusCode === 201) {
          const user = response?.data;
          Toast.show({
            type: "success",
            text1: `OTP Sent Successfully!`,
            text2:
              "Your verification code has been sent to your mobile number.",
          });

          setOtp(user?.otp);
          setEmail_or_mobile(mobile);

          setStep(2);
        } else {
          Toast.show({
            type: "error",
            text1: "Unexpected response",
          });
        }
      } catch (error) {
        Alert.alert("Error", error?.message || "Failed to send OTP");
      } finally {
        setLoading(false);
      }
    } else {
      //login part
      setLoading(true);
      setTimeout(() => {
        setEmail_or_mobile(mobile);
        setStep(4);
        setLoading(false);
      }, 500);

      return;
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
          <AuthHeader step={0} setStep={setStep} />

          <View style={styles.mailsign}>
            <Feather name="phone" size={40} color="#D7D7D7" />
          </View>
          <View style={styles.mailtitle}>
            {type === "signup" ? (
              <Text style={styles.mailtitletxt}>Your phone number</Text>
            ) : (
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "700",
                }}
              >
                Your registered phone number
              </Text>
            )}
          </View>
          <View style={styles.mailsubtitle}>
            <Text style={styles.mailsubtitletxt}>Enter your phone number.</Text>
          </View>

          {/* Phone Input Field */}
          <View style={styles.emailinputwrap}>
            <PhoneInput
              mobile={mobile}
              onChangeMobile={onChangeMobile}
              countryDetails={countryDetails}
              setCountryDetails={setCountryDetails}
            />
          </View>
          {type === "signup" ? <View></View> : <></>}
        </View>
      </View>

      {/* Continue Button */}
      <View style={styles.bottomsection}>
        <Buttons onPress={handlePhoneSubmit} isLoading={loading} />
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
});
