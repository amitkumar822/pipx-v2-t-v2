import { View, Text, Pressable } from "react-native";
import React from "react";
import { router } from "expo-router";
import { RFValue } from "react-native-responsive-fontsize";
import { Feather } from "@expo/vector-icons";
import { BackHeader } from "../helper/auth/BackHeader";

const ErrorScreen = ({ error, refetch }) => {
  return (
    <>
      <BackHeader />
      <View className="flex-1 justify-center items-center bg-white px-4">
        <Text className="text-2xl font-bold text-red-600 mb-2">Oops!</Text>

        <Text className="text-base text-center text-gray-700">
          {typeof error === "string"
            ? error
            : JSON.stringify(error?.response?.detail, null, 2) || JSON.stringify(error, null, 2) || "Something went wrong."}
        </Text>

        {/* ✅ Conditionally show retry button only if `refetch` is passed */}
        {typeof refetch === "function" && (
          <Pressable
            onPress={refetch}
            className="mt-6 flex-row items-center bg-blue-500 px-4 py-2 rounded-xl"
            android_ripple={{ color: "#ffffff20" }}
          >
            <Feather name="rotate-ccw" size={RFValue(16)} color="#fff" />
            <Text className="text-white ml-2" style={{ fontSize: RFValue(14) }}>
              Retry
            </Text>
          </Pressable>
        )}

        <Pressable onPress={() => router.back()} className="mt-4">
          <Text
            className="text-blue-500 underline"
            style={{ fontSize: RFValue(14) }}
          >
            Go Back
          </Text>
        </Pressable>
      </View>
    </>
  );
};

export default ErrorScreen;
