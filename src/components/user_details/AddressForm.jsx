import { View, Text, StyleSheet, Alert, Pressable } from "react-native";
import React, { useEffect, useState } from "react";
import Buttons from "./helper/Buttons";
import TextField from "./helper/TextField";
import { Ionicons, SimpleLineIcons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import { useUserProvider } from "@/src/context/user/userContext";
import { AuthHeader } from "../helper/auth/AuthHeader";
import { useRouter } from "expo-router";
import apiService from "@/src/services/api";

const AddressForm = ({ registrationType, setStep }) => {
  const router = useRouter();

  const {
    email_or_mobile,
    setEmail_or_mobile,
    userAgentDetails,
    setUserAgentDetails,
    username,
    setUsername,
    userAgentPassword,
    setUserAgentPassword,
    confirmPassword,
    setConfirmPassword,
    regRoleType,
  } = useUserProvider();

  const [address, setAddress] = useState({
    address: "",
    address1: "",
    city: "",
    postalCode: "",
    country: "",
  });

  const [isLoading, setIsLoading] = useState(false);

  // User and Agent registration handler
  const handleAddressSubmit = async () => {
    // Check if all required fields are filled
    const isFormIncomplete =
      !email_or_mobile ||
      !username ||
      !userAgentPassword ||
      !confirmPassword ||
      !userAgentDetails ||
      Object.keys(userAgentDetails).length === 0;

    if (isFormIncomplete) {
      Alert.alert(
        "Incomplete Information",
        "Please fill in all required fields before registering."
      );
      return;
    }

    const requestData = {
      first_name: userAgentDetails?.firstName,
      last_name: userAgentDetails?.lastName,
      username: username,
      date_of_birth: userAgentDetails?.birthday,
      gender: userAgentDetails?.gender,
      password: userAgentPassword,
      confirm_password: confirmPassword,
      user_type: regRoleType,
    };

    // Add address fields if they exist
    if (address) {
      requestData.address = address?.address;
      requestData.address1 = address?.address1;
      requestData.city = address?.city;
      requestData.postal_code = address?.postalCode;
      requestData.country = address?.country;
    }

    // Add email or mobile based on registration type
    if (registrationType === "email") {
      requestData.email = email_or_mobile;
    } else if (registrationType === "mobile") {
      requestData.mobile = email_or_mobile;
    }

    // Add document for signal providers
    if (regRoleType === "SIGNAL_PROVIDER" && userAgentDetails?.document) {
      requestData.document = userAgentDetails.document;
    }

    try {
      setIsLoading(true);
      const response = await apiService.register(requestData);

      if (response && response.statusCode === 201) {
        Toast.show({
          type: "success",
          text1: "Registration Successful 🎉",
          text2: `has been registered successfully.`,
        });
        setUserAgentDetails("");
        setAddress("");
        setEmail_or_mobile("");
        setUsername("");
        setUserAgentPassword("");
        setConfirmPassword("");

        router.push("/success");
      } else {
        Toast.show({
          type: "error",
          text1: "Registration Failed ❌",
          text2: response?.message || "Something went wrong. Please try again.",
        });
        console.error("Error AddressPage1: ", response);
      }
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Registration Failed ❌",
        text2: error?.message || "Something went wrong. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={{ marginLeft: -35 }}>
          <AuthHeader step={4} setStep={setStep} />
        </View>

        {/* Skip button also same handler used when user skip direact call api previous data send */}
        <Pressable onPress={handleAddressSubmit}>
          <View style={styles.skipBtn}>
            <Text style={styles.skipText}>Skip</Text>
            <Ionicons
              name="chevron-forward-outline"
              size={20}
              color="#007AFF"
            />
          </View>
        </Pressable>
      </View>

      <View style={styles.header}>
        <SimpleLineIcons name="location-pin" size={26} color="gray" />
        <Text style={styles.title}>Your address</Text>
      </View>

      {/* <Text style={styles.subtitle}>
        Lorem ipsum dolor sit amet, adipiscing elit, sed eiusmod tempor
        incididunt.
      </Text> */}
      <TextField
        placeholder="Address"
        value={address.address}
        onChangeText={(text) => setAddress({ ...address, address: text })}
      />
      <TextField
        placeholder="Address line 2"
        value={address.address1}
        onChangeText={(text) => setAddress({ ...address, address1: text })}
      />
      <TextField
        placeholder="City"
        value={address.city}
        onChangeText={(text) => setAddress({ ...address, city: text })}
      />
      <TextField
        placeholder="Postal code"
        value={address.postalCode}
        onChangeText={(text) => setAddress({ ...address, postalCode: text })}
      />
      <TextField
        placeholder="Country"
        value={address.country}
        onChangeText={(text) => setAddress({ ...address, country: text })}
      />

      <View>
        <Buttons
          onPress={handleAddressSubmit}
          title="Submit"
          isLoading={isLoading}
        />
      </View>
    </View>
  );
};

export default AddressForm;

const styles = StyleSheet.create({
  container: { padding: 20, paddingTop: 40 },
  headerRow: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  skipBtn: {
    flexDirection: "row",
    alignItems: "center",
  },
  skipText: {
    color: "#007AFF",
    fontSize: 16,
    fontWeight: "500",
    marginRight: 1,
  },
  title: { fontSize: 20, fontWeight: "700", marginBottom: 4 },
  subtitle: { color: "#666", marginBottom: 16 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
    paddingTop: 10,
  },
});
