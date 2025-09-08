import React from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

export const LoadingScreen = () => {
  return (
    <View className="flex-1 justify-center items-center bg-[#F0F4F8]">
      <View className="w-28 h-28 bg-white rounded-2xl shadow-lg flex items-center justify-center">
        <ActivityIndicator size="large" color="#007AFF" />
        <Text className="text-sm text-gray-700 font-medium mt-2">Loading...</Text>
      </View>

      {/* Optional text below loader */}
      <View className="mt-8 items-center">
        <MaterialIcons name="cloud-sync" size={32} color="#007AFF" />
        <Text className="mt-2 text-base text-gray-500 font-semibold">
          Fetching data securely...
        </Text>
      </View>
    </View>
  );
};
