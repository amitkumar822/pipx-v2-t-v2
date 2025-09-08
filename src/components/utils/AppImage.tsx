import React from "react";
import { Image } from "expo-image";
import { StyleProp, ImageStyle, StyleSheet } from "react-native";

type AppImageProps = {
  uri?: string | null;
  style?: StyleProp<ImageStyle>;
  contentFit?: "cover" | "contain" | "fill" | "scale-down" | "none";
  placeholder?: number; // Optional placeholder image
};

const DEFAULT_IMAGE = require("../../../assets/images/favicon.png");

export const AppImage: React.FC<AppImageProps> = ({
  uri,
  style,
  contentFit = "cover",
  placeholder,
}) => {
  return (
    <Image
      source={uri ? { uri } : DEFAULT_IMAGE}
      style={[styles.default, style]}
      contentFit={contentFit}
      cachePolicy="disk"
      placeholder={placeholder || DEFAULT_IMAGE}
      transition={300}
    />
  );
};

const styles = StyleSheet.create({
  default: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#f0f0f0",
  },
});
