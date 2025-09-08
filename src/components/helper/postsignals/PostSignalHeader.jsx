import { View, Text, StyleSheet, Pressable } from "react-native";
import React from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";

export default function PostSignalHeader() {
  const router = useRouter();

  return (
    <View style={styles.headercontainer}>
      <Pressable style={styles.backbtn} onPress={() => router.back()}>
        <Ionicons name="chevron-back-outline" size={24} color="#1E1E1E" />
        <Text style={styles.backtxt}>New Post</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  headercontainer: {
    width: "100%",
    height: 60,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 8,
    backgroundColor: "#FFFFFF",
  },
  backbtn: {
    height: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 6,
  },
  backtxt: {
    fontSize: 24,
    color: "#1E1E1E",
    fontWeight: "600",
    lineHeight: 26,
  },
});
