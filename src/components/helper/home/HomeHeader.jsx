import { View, Text, TouchableOpacity, Alert } from "react-native";
import React from "react";
import { RFValue } from "react-native-responsive-fontsize";

const HomeHeader = ({ showTab, setShowTab }) => {
  const labels = [
    "Agent Signals",
    "By currency",
    "Agent",
  ];

  const handlePress = (label) => {
    switch (label) {
      case "Agent Signals":
        setShowTab("Agent Signals");
        break;
      case "By currency":
        setShowTab("By currency");
        break;
      case "Agent":
        setShowTab("Agent");
        break;
      default:
        console.log("Unhandled press:", label);
    }
  };

  return (
    <>
      <View
        className="bg-[#FFFFFF] pb-2 border-indigo-200"
        style={{
          borderBottomWidth: 1,
          borderBottomColor: "#E0E0E0",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 3.84,
        }}
      >
        <Text
          className="font-extrabold text-black"
          style={{
            fontSize: RFValue(24),
          }}
        >
          PipX
        </Text>
      </View>

      <View className="flex-row flex-wrap gap-2 py-2 bg-white">
        {labels.map((label, index) => {
          const isActive = showTab === label;

          return (
            <TouchableOpacity key={index} onPress={() => handlePress(label)}>
              <Text
                className={`text-center px-4 py-2 rounded-xl font-semibold bg-[#EBF5FF] ${
                  isActive ? "text-[#2E75FF]" : " text-[#50555C]"
                }`}
                style={{ fontSize: RFValue(12) }}
              >
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </>
  );
};

export default HomeHeader;
