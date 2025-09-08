import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { UserFollowingScreen } from "@/src/components/screens/UserFollowingScreen";
import { AppStatusBar } from "@/src/components/utils/AppStatusBar";

const userBlocked = () => {

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <AppStatusBar backgroundColor="#FFF" barStyle="dark-content" />
      <UserFollowingScreen boxType="blocked" />
    </SafeAreaView>
  );
};

export default userBlocked;
