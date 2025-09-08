import React, { useContext } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { AuthContext } from "../../../src/store/AuthContext";
import { UserProfileScreen } from "../../../src/components/screens/UserProfileScreen";
import { AgentProfileScreen } from "@/src/components/screens/AgentProfileScreen";
import { AppStatusBar } from "@/src/components/utils/AppStatusBar";

export default function UserProfile() {
  const { userType } = useContext(AuthContext);

  if (userType === "USER") {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <AppStatusBar backgroundColor="#FFF" barStyle="dark-content" />
        <UserProfileScreen />
      </SafeAreaView>
    );
  }
  if (userType === "SIGNAL_PROVIDER") {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <AppStatusBar backgroundColor="#FFF" barStyle="dark-content" />
        <AgentProfileScreen />
      </SafeAreaView>
    );
  }
}
