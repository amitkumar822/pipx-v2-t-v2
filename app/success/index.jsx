import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import SuccessfullyAnimation from "@/src/components/helper/animation/SuccessfullyAnimation";

const SuccessScreen = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.centerContent}>
        <View>
          <SuccessfullyAnimation />
        </View>
        <Text style={styles.title}>Success!</Text>
        <Text style={styles.subtitle}>
          you’re all set up and ready to go.
        </Text>
      </View>

      <View style={[styles.buttonWrapper, { paddingBottom: insets.bottom + 12 }]}>
        <Pressable style={styles.button} onPress={() => router.push("/auth/login")}>
          <Text style={styles.buttonText}>Login</Text>
        </Pressable>
      </View>
    </View>
  );
};

export default SuccessScreen;

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#fff",
      justifyContent: "space-between",
      paddingHorizontal: 20,
    },
    centerContent: {
      alignItems: "center",
      justifyContent: "center",
      flex: 1,
    },
    iconCircle: {
      backgroundColor: "#007AFF",
      borderRadius: 50,
      padding: 18,
      marginBottom: 20,
    },
    title: {
      fontSize: 22,
      fontWeight: "700",
      color: "#000",
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 14,
      color: "#666",
      textAlign: "center",
    },
    buttonWrapper: {
      width: "100%",
    },
    button: {
      backgroundColor: "#007AFF",
      borderRadius: 10,
      paddingVertical: 14,
      alignItems: "center",
    },
    buttonText: {
      color: "#fff",
      fontWeight: "600",
      fontSize: 16,
    },
  });
  