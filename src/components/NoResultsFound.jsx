import { StyleSheet, Text, View } from "react-native";
import React from "react";

const NoResultsFound = () => {
  return (
    <View className="my-4 items-center justify-center">
      <Text className="text-[#888] text-sm">No results found</Text>
    </View>
  );
};

export default NoResultsFound;
