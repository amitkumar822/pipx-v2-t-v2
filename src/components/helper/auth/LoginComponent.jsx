import React from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import Entypo from "@expo/vector-icons/Entypo";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { router } from "expo-router";

export const LoginComponent = () => {
  return (
    <View style={styles.logincontainer}>
      <View style={styles.titletxt}>
        <Text style={styles.headtxt}>Welcome to PipX</Text>
        <Text style={styles.bodytxt}>
          To sign up, you need to be at least 18. Your birthday won’t be shared
          with other users.
        </Text>
      </View>
      <View style={styles.authinput}>
        <Pressable
          style={styles.email}
          onPress={() => {
            router.push("auth/email/login");
          }}
        >
          <MaterialIcons name="email" size={16} color="#FFF" />
          <Text style={styles.emailtxt}>Continue with Email</Text>
        </Pressable>

        <Pressable
          style={styles.phone}
          onPress={() => {
            router.push("auth/phone/login");
          }}
        >
          <Entypo name="mobile" size={16} color="#1A1C29" />
          <Text style={styles.phonetxt}>Continue with Phone</Text>
        </Pressable>
        
        {Platform.OS === "ios" ? (
          <Pressable style={styles.phone}>
            <FontAwesome6 name="apple" size={16} color="#1A1C29" />
            <Text style={styles.phonetxt}>Continue with apple</Text>
          </Pressable>
        ) : (
          <Pressable style={styles.phone}>
            <FontAwesome name="google" size={16} color="#1A1C29" />
            <Text style={styles.phonetxt}>Continue with Google</Text>
          </Pressable>
        )}
      </View>
      <View style={styles.tctextvw}>
        <Text style={styles.tctext}>
          If you are creating a new account,{" "}
          <Text style={styles.tctextspl}>Terms & Conditions</Text> and{" "}
          <Text style={styles.tctextspl}> Privacy Policy</Text> will apply.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  logincontainer: {
    flex: 1,
    width: "100%",
    justifyContent: "flex-start",
    alignItems: "center",
    gap: 12,
  },
  titletxt: {
    width: "80%",
    justifyContent: "center",
    alignItems: "center",
    gap: "6px",
  },
  headtxt: {
    color: "#1A1C29",
    fontFamily: "Poppins",
    fontSize: 24,
    fontStyle: "normal",
    fontWeight: "700",
  },
  bodytxt: {
    color: "#1A1C29",
    fontFamily: "Poppins",
    fontSize: 16,
    fontStyle: "normal",
    fontWeight: "400",
    textAlign: "center",
  },
  authinput: {
    width: "100%",
    justifyContent: "flex-start",
    alignItems: "center",
    gap: 0,
  },
  email: {
    width: "100%",
    backgroundColor: "#007AFF",
    paddingVertical: 16,
    borderRadius: 14,
    marginTop: 20,
    borderColor: "#007AFF",
    borderWidth: 2,
    flexDirection: "row",
    gap: 12,
    justifyContent: "center",
    alignItems: "center",
    bordeRadius: 14,
  },
  emailtxt: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  phone: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    paddingVertical: 16,
    borderRadius: 14,
    marginTop: 20,
    borderColor: "#D7D7D7",
    borderWidth: 2,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    bordeRadius: 14,
  },
  phonetxt: {
    color: "#1A1C29",
    fontSize: 16,
    fontWeight: "600",
  },
  tctextvw: {
    width: "80%",
  },
  tctext: {
    color: "#797979",
    fontFamily: "Roboto",
    fontSize: 12,
    fontStyle: "normal",
    fontWeight: "400",
    lineHeight: 20,
    textDecorationStyle: "solid",
    textDecorationColor: "#797979",
    textAlign: "center",
  },
  tctextspl: {
    textDecorationLine: "underline",
  },
});
