import React from "react";
import { View, Text, StyleSheet, TextInput } from "react-native";
import CountryPicker from "react-native-country-picker-modal";

export default function PhoneInput({
  mobile,
  onChangeMobile,
  countryDetails,
  setCountryDetails,
}) {
  return (
    <>
      <View style={styles.container}>
        <View style={styles.countryinput}>
          <CountryPicker
            withFilter
            withFlag
            withCallingCode
            withEmoji
            onSelect={(country) => {
              setCountryDetails(country);
            }}
            countryCode={countryDetails?.cca2 || "GB"}
          />

          <Text style={styles.code}>
            {countryDetails?.callingCode
              ? `+${countryDetails.callingCode}`
              : "+44"}
          </Text>
        </View>

        <TextInput
          style={styles.emailinput}
          onChangeText={onChangeMobile}
          value={mobile}
          placeholder="Phone number"
          keyboardType="numeric"
          maxLength={10}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  countryinput: {
    width: "28%",
    backgroundColor: "#F3F3F3",
    height: 56,
    paddingVertical: 10,
    // paddingHorizontal: 16,
    borderRadius: 14,
    marginTop: 20,
    borderColor: "#007AFF",
    borderWidth: 2,
    bordeRadius: 14,
    fontSize: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    // gap: 6,
  },
  flag: {
    fontSize: 20,
  },
  flagwrapper: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#B1B1B1",
    justifyContent: "center",
    alignItems: "center",
  },
  code: {
    fontSize: 22,
  },
  emailinput: {
    width: "70%",
    backgroundColor: "#F3F3F3",
    height: 56,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 14,
    marginTop: 20,
    borderColor: "#007AFF",
    borderWidth: 2,
    bordeRadius: 14,
    fontSize: 22,
  },
});
