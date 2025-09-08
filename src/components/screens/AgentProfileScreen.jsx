import React, { useContext, useEffect } from "react";
import { Text, View, StyleSheet, Alert } from "react-native";
import { ProfileHeader } from "../helper/profile/ProfileHeader";
import { ProfileBox } from "../helper/profile/ProfileBox";
import { useRouter } from "expo-router";
import { useLogout, useSignalProviderProfile } from "@/src/hooks/useApi";
import { AuthContext } from "@/src/store/AuthContext";
import { useUserProvider } from "@/src/context/user/userContext";
import { LoadingScreen } from "./LoadingScreen";

export const AgentProfileScreen = () => {
  const { setProfile } = useUserProvider();

  const { userType } = useContext(AuthContext);

  const { data, loading, error } = useSignalProviderProfile();

  const agentProfile = data?.data;
  
  useEffect(() => {
    if (agentProfile && userType === "SIGNAL_PROVIDER") {
      setProfile(agentProfile);
    }
  }, [agentProfile, userType]);

  if (loading) {
    return <LoadingScreen />;
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <Text className="text-2xl font-bold text-red-600 mb-2">Oops!</Text>
        <Text className="text-base text-gray-700">
          {typeof error === "string"
            ? error
            : error?.message || "Something went wrong."}

          {JSON.stringify(error, null, 2)}
        </Text>
      </View>
    );
  }

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
              // Execute the logout mutation (server-side logout)
              await logoutMutation.mutateAsync();

              // Always call the AuthContext logout to clear local state and storage
              await logout();

              // Navigate to auth screen
              router.push("/auth/login");
            } catch (error) {
              Alert.alert("Error", "Failed to log out. Please try again.");
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  // User Stats data - make this dynamic later
  const statsAgentData = [
    {
      value: agentProfile?.post || "0",
      label: "Posts",
      onPress: () => router?.push("/profile/agentcheckpostview"),
    },
    {
      value: agentProfile?.followers || "0",
      label: "Followers",
      onPress: () => router?.push("/profile/userfollowers"),
    },
    {
      value: `${agentProfile?.success_rate}%` || "0%",
      label: "Success rate",
      onPress: () => {},
    },
    {
      value: `${agentProfile?.win_post}: ${agentProfile?.lose_post}` || "0:0",
      label: "Win/Loss ratio",
      onPress: () => {},
    },
    // {
    //   value: "XXXX",
    //   label: "Lorem Ipsum",
    //   onPress: () => {},
    // },
    // {
    //   value: "XXXX",
    //   label: "Lorem Ipsum",
    //   onPress: () => {},
    // },
  ];

  return (
    <View style={styles.profilecontainer}>
      <ProfileHeader rightaction={handleLogout} />
      <ProfileBox profile={agentProfile} statsDataByRole={statsAgentData} />
    </View>
  );
};

const styles = StyleSheet.create({
  profilecontainer: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
  },
});
