import { View, Dimensions } from "react-native";
import React from "react";
import LottieView from "lottie-react-native";

const { width } = Dimensions.get("window");

const SuccessfullyAnimation = () => {
  return (
    <View>
      <LottieView
        source={require("@/assets/animation/success.json")}
        autoPlay
        loop
        style={{ width: width * 0.3, height: width * 0.3 }}
      />
    </View>
  );
};

export default SuccessfullyAnimation;
