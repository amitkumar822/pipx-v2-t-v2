import React, { useContext, useEffect } from "react";
import { View, StyleSheet, Alert } from "react-native";
import { ProfileHeader } from "../helper/profile/ProfileHeader";
import { ProfileBox } from "../helper/profile/ProfileBox";
import { useUserProvider } from "@/src/context/user/userContext";
import { useLogout, useUserProfile } from "@/src/hooks/useApi";
import { useRouter } from "expo-router";
import { AuthContext } from "@/src/store/AuthContext";
import ErrorScreen from "./ErrorScreen";
import Toast from "react-native-toast-message";
import { LoadingScreen } from "./LoadingScreen";

export const UserProfileScreen = () => {
  const { userType } = useContext(AuthContext);

  // This allows us to avoid prop drilling and makes the component cleaner
  const { setProfile } = useUserProvider();

  //^ The profile data will be fetched using the useUserProfile hook.

  // New logic using useUserProfile hook
  const { data: profile, isLoading, error, refetch } = useUserProfile();

  useEffect(() => {
    if (profile && userType === "USER") {
      setProfile(profile?.data);
    }
  }, [profile, userType]); // Removed setProfile from dependencies

  //& Logout logic can be added here if needed
  const router = useRouter();
  const { logout } = useContext(AuthContext);
  const logoutMutation = useLogout();

  const handleLogout = async () => {
    Alert.alert(
      "Are you sure?",
      "Do you really want to logout?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "OK",
          onPress: async () => {
            try {
              // Execute the logout mutation
              await logoutMutation.mutateAsync();

              // Also call the AuthContext logout to clear local state
              await logout();

              // Navigate to auth screen
              router.replace("/auth/login");
            } catch (error) {
              Alert.alert("Error", "Failed to log out. Please try again.");
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (error) {
    return <ErrorScreen error={error} refetch={refetch} />;
  }

  // User Stats data - make this dynamic later
  const statsUserData = [
    {
      value: profile?.data?.following || "0",
      label: "Following",
      onPress: () => router.push("/profile/userfollowing"),
    },
    {
      value: profile?.data?.blocked_signal_provider || "0",
      label: "Blocked",
      onPress: () => router.push("/profile/userBlocked"),
    },
  ];

  return (
    <View style={styles.profilecontainer}>
      <ProfileHeader backaction={() => router.back()} rightaction={handleLogout} />
      <ProfileBox profile={profile?.data} statsDataByRole={statsUserData} />
    </View>
  );
};

const styles = StyleSheet.create({
  profilecontainer: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
});
