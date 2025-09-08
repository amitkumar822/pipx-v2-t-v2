import React from "react";
import { SubscriptionPlansScreen } from "@/src/components/screens/SubscriptionPlansScreen";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppStatusBar } from "@/src/components/utils/AppStatusBar";

const Subscription = () => {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      <AppStatusBar backgroundColor="#FFF" barStyle="dark-content" />
      <SubscriptionPlansScreen />
    </SafeAreaView>
  );
};

export default Subscription;
