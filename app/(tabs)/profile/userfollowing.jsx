import { UserFollowingScreen } from "@/src/components/screens/UserFollowingScreen";
import { AppStatusBar } from "@/src/components/utils/AppStatusBar";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";

export default function UserFollowing() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <AppStatusBar backgroundColor="#FFF" barStyle="dark-content" />
      <UserFollowingScreen boxType="following" />
    </SafeAreaView>
  );
}
