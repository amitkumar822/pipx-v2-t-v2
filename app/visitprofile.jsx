import { View, Text, Pressable, Alert, ActivityIndicator } from "react-native";
import React, { useEffect, useState } from "react";
import { useProfileById } from "@/src/components/helper/profile/helper/useProfileById";
import { router, useLocalSearchParams, useFocusEffect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useCallback } from "react";
import { ProfileBox } from "@/src/components/helper/profile/ProfileBox";
import { ProfileHeader } from "@/src/components/helper/profile/ProfileHeader";
import { FontAwesome } from "@expo/vector-icons";
import {
  useFollowSignalProvider,
  useUnfollowSignalProvider,
} from "@/src/hooks/useApi";
import ReportBlockModal from "@/src/components/helper/ReportBlockModel";
import { AppStatusBar } from "@/src/components/utils/AppStatusBar";

const visitprofile = () => {
  const { id, userType, backRoutePath } = useLocalSearchParams();

  // Add staleTime: 0 to always fetch fresh data when component mounts
  const {
    data: profileData,
    isLoading,
    error,
    refetch,
  } = useProfileById(id, userType, {
    staleTime: 0,
    cacheTime: 0,
  });
  // Using optional chaining for both profileData?.data and array access [0]
  const profile = profileData?.data?.[0];

  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);

  // Initialize follow state and followers count whenever the profile changes
  useEffect(() => {
    if (profile?.is_follow !== undefined) {
      setIsFollowing(profile.is_follow);
    }

    // Initialize followers count from profile data
    const initialCount =
      (profile?.followers > 0 && profile?.followers) ||
      profile?.followers_count ||
      0;

    setFollowersCount(Number(initialCount));
  }, [profile]);

  // Refresh data when screen comes into focus (e.g., when navigating back to this screen)
  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      if (isActive) {
        refetch();
      }
      return () => {
        isActive = false;
      };
    }, [refetch])
  );

  // User Stats data - make this dynamic later
  const statsUserData = [
    {
      value: profile?.following || "0",
      label: "Following",
      // onPress: () => router.push("/profile/userfollowing"), // this navigation is changed userFollowing route.push("/userfollowing"),
      onPress: () => {},
    },
    // {
    //   value: profile?.blocked_signal_provider || "0",
    //   label: "Blocked",
    //   onPress: () => router.push("/profile/userBlocked"),
    // },
  ];

  // Agent Stats data - make this dynamic later
  const statsAgentData = [
    {
      value: profile?.signals || "0",
      label: "Signals Posted", //▶️
      onPress: () => {},
    },
    {
      value: String(followersCount || 0),
      label: "Followers",
      // onPress: () => router?.push("/profile/userfollowers"),
      onPress: () => {},
    },
    {
      value: `${profile?.success_rate}%` || "0%",
      label: "Win rate", //▶️
      onPress: () => {},
    },
    {
      value: `${profile?.longest_streak}` || "0",
      label: "Longest Streak",
      onPress: () => {},
    },
    {
      value: profile?.net_pips || "0",
      label: "Net Pips", //▶️
      onPress: () => {},
    },
    // {
    //   value: "XXXX",
    //   label: "Average Pips/Trade",
    //   onPress: () => {},
    // },
  ];

  const statsDataByRole =
    profile?.user_type === "USER" ? statsUserData : statsAgentData;

  // Follow Signal Provider Modal
  const [visible, setVisible] = useState(false);
  const [modalType, setModalType] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Handle follow button click - show modal first
  const handleFollowUnfollowOpenModal = () => {
    // Prevent state updates if component might be unmounting
    requestAnimationFrame(() => {
      setVisible(true);
      const newModalType = isFollowing ? "unfollow" : "follow";
      setModalType(newModalType);
    });
  };

  // Follow Signal Provider Mutation
  const { mutate: followSignalProviderMutation } = useFollowSignalProvider();

  // Handle Unfollow Signal Provider by USER Hook
  const { mutate: unfollowSignalProviderMutation } =
    useUnfollowSignalProvider();

  // Follow and Subscription Logic
  const handleFollowUnFollow = () => {
    if (userType === "SIGNAL_PROVIDER" && typeof profile?.id === "number") {
      // Capture values needed for the API call to avoid stale closures
      const profileId = profile.id;
      setIsProcessing(true);

      if (isFollowing) {
        // Optimistically update UI - unfollow and decrease followers count
        setIsFollowing(false);
        setFollowersCount((prevCount) => Math.max(0, prevCount - 1));

        unfollowSignalProviderMutation(profileId, {
          onSuccess: () => {
            // Wrap state updates in requestAnimationFrame to prevent view tag errors
            requestAnimationFrame(() => {
              setModalType("success");

              setIsProcessing(false);
              // Force refetch to get fresh data after unfollow
              refetch();
            });
          },
          onError: (error) => {
            // Wrap state updates in requestAnimationFrame
            requestAnimationFrame(() => {
              // Revert UI on error
              setIsFollowing(true);
              setFollowersCount((prevCount) => prevCount + 1); // Restore previous count
              setIsProcessing(false);
              Alert.alert("Error", error?.message || "Failed to unfollow.", [
                { text: "OK" },
              ]);
              setVisible(false); // Close modal on error
            });
          },
        });
      } else {
        // Optimistically update UI - follow and increase followers count
        setIsFollowing(true);
        setFollowersCount((prevCount) => prevCount + 1);

        followSignalProviderMutation(profileId, {
          onSuccess: () => {
            // Wrap state updates in requestAnimationFrame
            requestAnimationFrame(() => {
              setModalType("success");

              setIsProcessing(false);
              // Force refetch to get fresh data after follow
              refetch();
            });
          },
          onError: (error) => {
            // Wrap state updates in requestAnimationFrame
            requestAnimationFrame(() => {
              // Revert UI on error
              setIsFollowing(false);
              setFollowersCount((prevCount) => Math.max(0, prevCount - 1)); // Restore previous count
              setIsProcessing(false);
              Alert.alert("Error", error?.message || "Failed to follow", [
                { text: "OK" },
              ]);
              setVisible(false); // Close modal on error
            });
          },
        });
      }
    }
  };

  const handleSubscribe = () => {
    router.push({
      pathname: "/subscription",
      params: {
        signalProviderId: profile?.id,
      },
    });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      <AppStatusBar backgroundColor="#FFF" barStyle="dark-content" />
      
      <ProfileHeader
        backtxt={`@${profileData?.data?.[0]?.username || "Profile"}`}
        righttxt={""}
        righticon={null}
        backaction={() => router.push(`${backRoutePath}`)}
      />

      {isLoading ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      ) : error ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Text>Error loading profile. Please try again.</Text>
        </View>
      ) : profileData?.data ? (
        <ProfileBox
          profile={profile}
          statsDataByRole={statsDataByRole}
          visitType={true}
        />
      ) : (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Text>No profile data available.</Text>
        </View>
      )}

      {/* Additional components can be added here */}
      {profile && (
        <View
          className={`w-[94%] mx-auto mt-2 ${userType === "USER" && "hidden"}`}
        >
          <View className="flex-row justify-between items-center mb-4">
            <Pressable
              onPress={handleFollowUnfollowOpenModal}
              disabled={isProcessing}
              className={`${
                isFollowing ? "bg-white border border-red-500" : "bg-blue-500"
              } px-6 py-2 rounded-xl w-[48%] flex-row items-center justify-center`}
            >
              {isProcessing ? (
                <ActivityIndicator
                  size="small"
                  color={isFollowing ? "#EF4444" : "#FFFFFF"}
                />
              ) : (
                <Text
                  className={`${
                    isFollowing ? "text-red-500" : "text-white"
                  } text-base font-medium`}
                >
                  {isFollowing ? "Unfollow" : "Follow"}
                </Text>
              )}
            </Pressable>

            <Pressable
              onPress={handleSubscribe}
              className="border border-yellow-400 px-4 py-2 rounded-xl w-[48%] flex-row items-center space-x-2 justify-center gap-2"
            >
              <FontAwesome name="star" size={16} color="#fbbf24" />
              <Text className="text-yellow-500 font-medium">Subscribed</Text>
            </Pressable>
          </View>

          <View className="bg-yellow-400 px-4 py-3 rounded-md mb-4 flex-row items-center justify-center gap-2">
            <FontAwesome name="star" size={16} color="white" />
            <Text className="text-white text-xs font-bold">
              Subscription is valid from 13ᵗʰ May, 2025 to 13ᵗʰ Nov, 2025
            </Text>
          </View>

          <Pressable className="border border-yellow-400 px-4 py-2 rounded-xl w-full flex-row items-center justify-center">
            <Text className="text-yellow-500 text-center font-medium text-lg">
              Upgrade subscription
            </Text>
          </Pressable>
        </View>
      )}

      <ReportBlockModal
        visible={visible}
        userName={profile?.username || "User"}
        fullName={`${profile?.first_name || ""} ${profile?.last_name || ""}`}
        type={modalType}
        setModalType={setModalType}
        onClose={() => setVisible(false)}
        onAction={handleFollowUnFollow}
      />
    </SafeAreaView>
  );
};

export default visitprofile;
