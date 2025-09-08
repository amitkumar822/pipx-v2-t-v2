import React, { useEffect, useState } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import Entypo from "@expo/vector-icons/Entypo";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { router } from "expo-router";
import { useUserProvider } from "@/src/context/user/userContext";

export const SignUpComponent = () => {
  const { setRegRoleType } = useUserProvider();
  const [agentSignup, setAgentSignup] = useState(true);

  useEffect(() => {
    const roleType = agentSignup ? "USER" : "SIGNAL_PROVIDER";
    setRegRoleType(roleType);
  }, [agentSignup])

  return (
    <View style={styles.logincontainer}>
      <View style={styles.titletxt}>
        <Pressable
          style={styles.userselection}
          onPress={() => setAgentSignup(!agentSignup)}
        >
          <View style={agentSignup ? styles.selected : styles.unselected}>
            <Text
              style={
                agentSignup
                  ? styles.selectedusertext
                  : styles.unselectedusertext
              }
            >
              User Signup
            </Text>
          </View>

          <View style={agentSignup ? styles.unselected : styles.selected}>
            <Text
              style={
                agentSignup
                  ? styles.unselectedusertext
                  : styles.selectedusertext
              }
            >
              Agent Signup
            </Text>
          </View>
        </Pressable>

        <Text style={styles.bodytxt}>
          Please select your preferred method to continue setting up your
          account
        </Text>
      </View>
      <View style={styles.authinput}>
        <Pressable
          style={styles.email}
          onPress={() => {
            router.push("/auth/email/signup");
          }}
        >
          <MaterialIcons name="email" size={16} color="#FFF" />
          <Text style={styles.emailtxt}>Continue with Email</Text>
        </Pressable>

        <Pressable
          style={styles.phone}
          onPress={() => {
            router.push("/auth/phone/signup");
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
  userselection: {
    width: "95%",
    borderColor: "#F5493B",
    borderWidth: 2,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: 17,
    overflow: "hidden",
    padding: 2,
  },
  selected: {
    width: "50%",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 12,
    backgroundColor: "#F5493B",
    borderRadius: 14,
  },
  unselected: {
    width: "50%",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 12,
    backgroundColor: "#FFF",
  },
  selectedusertext: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  unselectedusertext: {
    color: "#A8A8A8",
    fontSize: 16,
    fontWeight: "600",
  },

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
    gap: 12,
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
    flexDirection: "column",
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
