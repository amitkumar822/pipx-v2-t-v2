import React, { useContext } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { AuthContext } from "../../../src/store/AuthContext";
import NotificationScreen from "../../../src/components/screens/NotificationScreen";
import { AppStatusBar } from "@/src/components/utils/AppStatusBar";

export default function Notif() {
  const { userType } = useContext(AuthContext);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <AppStatusBar backgroundColor="#FFF" barStyle="dark-content" />
      <NotificationScreen />
    </SafeAreaView>
  );
}
