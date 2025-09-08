import React, { memo } from "react";
import { Text, View, StyleSheet, Pressable } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { RFValue } from "react-native-responsive-fontsize";

export const ProfileHeader = memo(({
  backtxt = "My profile",
  backaction = () => {},
  righttxt = "Logout",
  righticon,
  rightaction, // function to handle right action (submit handler)
}) => {
  return (
    <View style={styles.headercontainer}>
      <Pressable style={styles.backbtn} onPress={backaction}>
        <Ionicons
          name="chevron-back-outline"
          color="#1E1E1E"
          style={{
            fontSize: RFValue(16),
          }}
        />
        <Text style={styles.backtxt}>{backtxt}</Text>
      </Pressable>

      <Pressable style={styles.backbtn} onPress={rightaction}>
        {Boolean(righticon) && (
          <MaterialIcons name="logout" size={24} color="#F5493B" />
        )}
        <Text style={styles.logouttxt}>{righttxt}</Text>
      </Pressable>
    </View>
  );
});

const styles = StyleSheet.create({
  headercontainer: {
    width: "100%",
    height: 60,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 18,
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
    fontSize: RFValue(16),
    color: "#1E1E1E",
    fontWeight: "600",
    lineHeight: 26,
  },
  logouttxt: {
    fontSize: 20,
    color: "#F5493B",
    fontWeight: "500",
    lineHeight: 22,
  },
});
