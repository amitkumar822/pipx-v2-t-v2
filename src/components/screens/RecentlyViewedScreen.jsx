import { View, Text } from "react-native";
import React, { useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useUserProvider } from "@/src/context/user/userContext";

const RecentlyViewedScreen = () => {
  //^ ===== Reset currency data on Agent screen mount =====
  const { setCurrencyAssetDetails } = useUserProvider();

  useEffect(() => {
    // Clear asset-based signal data when this screen mounts
    setCurrencyAssetDetails([]);
  }, []);
  //^ ===== End: Reset currency data on Agent screen mount =====
  
  return (
    <SafeAreaView
      style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
    >
      <Text>RecentlyViewedScreen</Text>
    </SafeAreaView>
  );
};

export default RecentlyViewedScreen;
