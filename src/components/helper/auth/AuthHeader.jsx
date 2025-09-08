import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";

export const AuthHeader = ({ step, setStep }) => {
  const handleBackPress = () => {
    if (step === 0) {
      router.back();
    } else {
      setStep(step);
    }
  };

  return (
    <View style={styles.headercontainer}>
      <Pressable onPress={handleBackPress}>
        <View style={styles.backbtn}>
          <Ionicons name="chevron-back-outline" size={24} color="#007AFF" />
          <Text style={styles.backTxt}>Back</Text>
        </View>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  headercontainer: {
    width: "100%",
    height: 35,
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  backbtn: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    gap: 0,
  },
  backTxt: {
    color: "#007AFF",
    fontSize: 17,
    fontWeight: "500",
  },
});
