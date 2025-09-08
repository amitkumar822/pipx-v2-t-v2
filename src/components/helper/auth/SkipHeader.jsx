import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";

const SkipHeader = (onPress) => {
  return (
    <View style={styles.headercontainer}>
      <Pressable onPress={onPress}>
        <View style={styles.skipBtn}>
          <Text style={styles.skipTxt}>Skip</Text>
          <Ionicons name="chevron-forward-outline" size={20} color="#007AFF" />
        </View>
      </Pressable>
    </View>
  );
};

export default SkipHeader;

const styles = StyleSheet.create({
    headercontainer: {
      // width: "100%",
      height: 35,
      flexDirection: "row",
      justifyContent: "flex-end",
      alignItems: "center",
      paddingHorizontal: 16,
    },
    skipBtn: {
      flexDirection: "row",
      alignItems: "center",
    },
    skipTxt: {
      color: "#007AFF",
      fontSize: 17,
      fontWeight: "500",
      marginRight: 2,
    },
  });
  
