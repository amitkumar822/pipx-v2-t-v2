import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { EditProfileScreen } from "../../../src/components/screens/EditProfileScreen";
import { AppStatusBar } from "@/src/components/utils/AppStatusBar";

export default function UserFollowing() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <AppStatusBar backgroundColor="#FFF" barStyle="dark-content" />
      <EditProfileScreen />
    </SafeAreaView>
  );
}
