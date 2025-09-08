import React, { useContext } from "react";
import { Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AuthContext } from "../../../src/store/AuthContext";
import UserSearchScreen from "@/src/components/helper/search/UserSearchScreen";
import AgentSearchScreen from "@/src/components/helper/search/AgentSearchScreen";
import { AppStatusBar } from "@/src/components/utils/AppStatusBar";

export default function Search() {
  const { userType } = useContext(AuthContext);

  if (userType === "USER") {
    return (
      <SafeAreaView className="flex-1 bg-[#FFFFFF]">
        <AppStatusBar backgroundColor="#FFF" barStyle="dark-content" />
        <UserSearchScreen />
      </SafeAreaView>
    );
  }

  if (userType === "SIGNAL_PROVIDER") {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
        <AppStatusBar backgroundColor="#FFF" barStyle="dark-content" />
        <AgentSearchScreen />
      </SafeAreaView>
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
