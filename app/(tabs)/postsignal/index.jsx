import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import PostSignalScreen from "../../../src/components/screens/PostSignalScreen";
import { AppStatusBar } from "@/src/components/utils/AppStatusBar";

export default function PostSignalProfile() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <AppStatusBar backgroundColor="#FFF" barStyle="dark-content" />
      <PostSignalScreen />
    </SafeAreaView>
  );
}
