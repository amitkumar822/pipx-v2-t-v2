import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  Alert,
} from "react-native";
import React, { useState } from "react";
import TextField from "./helper/TextField";
import Buttons from "./helper/Buttons";
import { FontAwesome } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import { useUserProvider } from "@/src/context/user/userContext";
import { AuthHeader } from "../helper/auth/AuthHeader";
import FileUploadField from "./helper/FileUploadField";

const UserAgentDetailsForm = ({ setStep }) => {
  const { setUserAgentDetails, regRoleType } = useUserProvider();

  const [userDetails, setUserDetails] = useState({
    firstName: "",
    lastName: "",
    birthday: "",
    gender: "",
    document: null,
  });

  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === "ios");

    if (selectedDate) {
      setDate(selectedDate);

      // ✅ Format date as YYYY-MM-DD
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
      const day = String(selectedDate.getDate()).padStart(2, "0");

      const formattedDate = `${year}-${month}-${day}`;

      setUserDetails({ ...userDetails, birthday: formattedDate });
    }
  };

  const [loading, setLoading] = useState(false);

  // handle Submit
  const handleUserDetailsSubmit = async () => {
    if (!userDetails) {
      Alert.alert("All field is required");
      return;
    }
    

    setLoading(true);

    setTimeout(() => {
      setUserAgentDetails(userDetails);
      setStep(7);
      setLoading(false);
    }, 500);
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={20}
      >
        <View style={{ paddingTop: 10 }}>
          <AuthHeader step={4} setStep={setStep} />
        </View>
        <ScrollView
          contentContainerStyle={{ padding: 20, paddingBottom: 80 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <FontAwesome name="vcard-o" size={28} color="gray" />
            <Text style={styles.title}>Your details</Text>
          </View>

          {/* <Text style={styles.subtitle}>
            Lorem ipsum dolor sit amet, adipiscing elit, sed eiusmod tempor
            incididunt.
          </Text> */}

          <View style={styles.form}>
            <TextField
              placeholder="First name"
              value={userDetails.firstName}
              onChangeText={(text) =>
                setUserDetails({ ...userDetails, firstName: text })
              }
            />

            <TextField
              placeholder="Last name"
              value={userDetails.lastName}
              onChangeText={(text) =>
                setUserDetails({ ...userDetails, lastName: text })
              }
            />

            {/* 🎯 Birthday - Touchable Date Picker */}
            <TouchableOpacity onPress={() => setShowDatePicker(true)}>
              <TextField
                placeholder="Birthday (mm/dd/yyyy)"
                value={userDetails.birthday}
                editable={false}
              />
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={date}
                mode="date"
                display="default"
                onChange={handleDateChange}
              />
            )}

            {/* 🎯 Gender Picker */}
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={userDetails.gender}
                onValueChange={(value) =>
                  setUserDetails({ ...userDetails, gender: value })
                }
              >
                <Picker.Item label="Select Gender" value="" />
                <Picker.Item label="Male" value="Male" />
                <Picker.Item label="Female" value="Female" />
                <Picker.Item label="Other" value="Other" />
              </Picker>
            </View>

            {regRoleType === "SIGNAL_PROVIDER" && (
              <FileUploadField
                onFileSelect={(file) =>
                  setUserDetails({ ...userDetails, document: file })
                }
              />
            )}

            <Buttons onPress={handleUserDetailsSubmit} isLoading={loading} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default UserAgentDetailsForm;

const styles = StyleSheet.create({
  container: {
    paddingTop: 30,
    flex: 1,
    height: "100%",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 4,
  },
  subtitle: {
    color: "#666",
    marginBottom: 16,
  },
  form: {
    marginTop: 10,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginBottom: 20,
    overflow: "hidden",
  },
  confirmPasswordContainer: {
    position: "relative",
  },
  confirmIcon: {
    position: "absolute",
    top: "25%",
    right: "5%",
  },
});
