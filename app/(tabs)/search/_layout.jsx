import { Text, View } from "react-native";
import React, { Component } from "react";
import { Stack } from "expo-router";

export default function SearchLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
  );
}
