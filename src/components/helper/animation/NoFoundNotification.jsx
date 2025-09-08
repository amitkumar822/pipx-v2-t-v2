import React from "react";
import { View, Text, Dimensions } from "react-native";
import LottieView from "lottie-react-native";
import { RFValue } from "react-native-responsive-fontsize";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

const NoNotifications = () => {
  return (
    <View className="flex-1 w-full items-center justify-center">
      {/* Lottie Animation */}
      <LottieView 
        source={require("@/assets/animation/Notification_Bell.json")}
        autoPlay
        loop
        style={{ width: width * 0.7, height: width * 0.7 }}
      />
      
      {/* Text */}
      <Text className=" font-semibold text-gray-800 -mt-8" style={{
        fontSize: RFValue(16),
      }}>
        No Notifications Found
      </Text>
      <Text className=" text-gray-500 text-center mt-2" style={{
        fontSize: RFValue(12),
      }}>
        You’re all caught up! New notifications will appear here.
      </Text>
    </View>
  );
};

export default NoNotifications;
