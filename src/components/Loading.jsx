import { View, Text, ActivityIndicator } from "react-native";
import React from "react";

const Loading = () => {
  return (
    <View className="flex-1 justify-center items-center">
      <View className="bg-gray-100 p-1 rounded-full">
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
      <Text className="mt-2">Loading...</Text>
    </View>
  );
};

export default Loading;
