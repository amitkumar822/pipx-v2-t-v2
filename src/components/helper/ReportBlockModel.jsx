import React, { useState } from "react";
import {
  View,
  Text,
  Pressable,
  Dimensions,
  Modal,
  Platform,
} from "react-native";
import Animated, { FadeInDown, FadeOutDown } from "react-native-reanimated";
import { BlurView } from "expo-blur";
import SuccessfullyAnimation from "./animation/SuccessfullyAnimation";

const getSuccessMessage = (type) => {
  switch (type) {
    case "block":
      return "The account has been successfully blocked.";
    case "unblock":
      return "The account has been unblocked.";
    case "report":
      return "Thanks for reporting. We'll review the account shortly.";
    case "unfollow":
      return "You have unfollowed this user.";
    case "both":
      return "The account has been blocked and unfollowed.";
    case "postReport":
      return "Thanks for reporting the post. We'll review it shortly.";
    case "follow":
      return "You are now following this user.";
    default:
      return "Action completed successfully.";
  }
};

const ReportBlockModal = ({
  visible,
  onClose,
  setModalType,
  type = "block", // "report", "block", "both", "success", "unblock"
  userName = "User",
  fullName = "",
  onAction,
}) => {
  const isSuccess = type === "success";
  const isUnblock = type === "unblock";
  const isFollow = type === "follow";
  const isUnFollow = type === "unfollow";
  const isBoth = type === "both";
  const isReport = type === "report";
  const isPostReport = type === "postReport";
  const isBlock = type === "block";

  const [successRoleType, setSuccessRoleType] = useState("");

  const renderActions = () => {
    if (isBoth) {
      return (
        <View>
          <Pressable
            className="border-b border-gray-300 pb-3"
            onPress={() => {
              (setModalType("report"), setSuccessRoleType("report"));
            }}
          >
            <Text className="text-center text-red-500 font-semibold text-base">
              Report
            </Text>
          </Pressable>
          <Pressable
            className="pt-2"
            onPress={() => {
              (setModalType("block"), setSuccessRoleType("block"));
            }}
          >
            <Text className="text-center text-red-500 font-semibold text-base">
              Block
            </Text>
          </Pressable>
        </View>
      );
    }

    if (isReport || isBlock) {
      const label = isReport ? "Report" : "Block";
      return (
        <>
          <Text className="text-center text-base font-semibold mb-3 capitalize">
            {isReport
              ? `Are you sure you want to report\n${userName}?`
              : `Block Agent ${userName}?`}
          </Text>

          <Pressable
            className="bg-red-100 py-3 rounded-xl mb-3"
            onPress={
              type === "report" ? onAction.handlerReport : onAction.handlerBlock
            }
          >
            <Text className="text-center text-red-500 font-bold text-base">
              {label}
            </Text>
          </Pressable>
        </>
      );
    }

    if (isUnblock || isUnFollow) {
      return (
        <>
          <Text className="text-center text-base font-semibold mb-3">
            Do you want to {isUnblock ? "unblock" : "unfollow"} {fullName} (@
            {userName})?
          </Text>
          <Pressable
            className="bg-blue-100 py-3 rounded-xl mb-3"
            onPress={() => {
              setSuccessRoleType(isUnblock ? "unblock" : "unfollow");
              onAction();
            }}
          >
            <Text className="text-center text-blue-600 font-bold text-base">
              {isUnblock ? "Unblock" : "Unfollow"}
            </Text>
          </Pressable>
        </>
      );
    }

    if (isFollow) {
      return (
        <>
          <Text className="text-center text-base font-semibold mb-3">
            Do you want to follow {fullName} (@{userName})?
          </Text>
          <Pressable
            className="bg-blue-100 py-3 rounded-xl mb-3"
            onPress={() => {
              setSuccessRoleType("follow");
              onAction();
            }}
          >
            <Text className="text-center text-blue-600 font-bold text-base">
              Follow
            </Text>
          </Pressable>
        </>
      );
    }

    if (isPostReport) {
      return (
        <>
          <Text className="text-center text-base font-semibold mb-3">
            Are you sure you want to report this post?
          </Text>

          <Pressable
            className="bg-red-100 py-3 rounded-xl mb-3"
            onPress={() => {
              setSuccessRoleType("postReport");
              onAction();
            }}
          >
            <Text className="text-center text-red-500 font-bold text-base">
              Report Post
            </Text>
          </Pressable>
        </>
      );
    }

    return (
      <View className="justify-center items-center mb-4">
        <SuccessfullyAnimation />
        <Text className="text-center font-semibold text-lg mt-2">
          {/* {successRoleType === "block"
            ? "The account has been blocked."
            : "Thanks for letting us know. The account has been reported."} */}
          {getSuccessMessage(successRoleType)}
        </Text>
      </View>
    );
  };

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View
        className="flex-1 justify-end pb-5"
        style={{
          backgroundColor: "rgba(0,0,0,0.6)",
        }}
      >
        {Platform.OS === "ios" ? (
          <BlurView
            intensity={50}
            tint="light"
            className="flex-1 justify-end"
          />
        ) : null}

        <View className="w-[95%] mx-auto bg-transparent">
          <Animated.View entering={FadeInDown} exiting={FadeOutDown}>
            <View className="bg-white px-5 py-6 rounded-3xl">
              {renderActions()}
            </View>

            <Pressable
              className="bg-white py-3 rounded-xl my-2"
              onPress={onClose}
            >
              <Text className="text-center text-black font-semibold text-base">
                Cancel
              </Text>
            </Pressable>
          </Animated.View>
        </View>
      </View>
    </Modal>
  );
};

export default ReportBlockModal;
