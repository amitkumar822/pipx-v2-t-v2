import React from "react";
import { View, Text, Dimensions, Pressable } from "react-native";
import LottieView from "lottie-react-native";
import { useRouter } from "expo-router";

const { width } = Dimensions.get("window");

const NoDataFound = ({ message = "No data found.", goBackVisible = true }) => {
  const router = useRouter();

  return (
    <View className="flex-1 items-center justify-center px-4">
      {/* Lottie Animation */}
      <LottieView
        source={require("@/assets/animation/No-Data.json")}
        autoPlay
        loop
        style={{ width: width * 0.7, height: width * 0.7 }}
      />

      {/* Message */}
      <Text className="text-center text-lg font-semibold text-gray-700 mt-4">
        {message} Please go back to the previous screen.
      </Text>

      {goBackVisible && (
        <Pressable
          onPress={() => router.back()}
          className="mt-6 bg-blue-500 px-5 py-2 rounded-full"
        >
          <Text className="text-white text-base font-semibold">Go Back</Text>
        </Pressable>
      )}
    </View>
  );
};

export default NoDataFound;
