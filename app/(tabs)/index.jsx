import React, { useContext } from "react";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AuthContext } from "../../src/store/AuthContext";
import HomeScreen from "@/src/components/helper/home/HomeScreen";
import { AppStatusBar } from "@/src/components/utils/AppStatusBar";

export default function Home() {
  const { userType } = useContext(AuthContext);

  if (userType === "USER") {
    return (
      <View style={{ flex: 1, paddingHorizontal: 10, backgroundColor: "#FFF" }}>
        <AppStatusBar backgroundColor="#FFF" barStyle="dark-content" />
        <HomeScreen />
      </View>
    );
  }

  if (userType === "SIGNAL_PROVIDER") {
    return (
      <View style={{ flex: 1, paddingHorizontal: 10, backgroundColor: "#FFF" }}>
        <AppStatusBar backgroundColor="#FFF" barStyle="dark-content" />
        <HomeScreen />
      </View>
    );
  }

  // Default fallback for undefined or other user types
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <AppStatusBar backgroundColor="#FFF" barStyle="dark-content" />
      <Text>Loading...</Text>
    </SafeAreaView>
  );
}
