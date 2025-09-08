import { Ionicons } from "@expo/vector-icons";
import { Tabs, useLocalSearchParams } from "expo-router";
import React, { useContext, useEffect } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { router } from "expo-router";
import { AuthContext } from "@/src/store/AuthContext";
import { NotificationBadge } from "@/src/components/helper/NotificationBadge";
import { RFValue } from "react-native-responsive-fontsize";

export default function TabLayout() {
  const { userType } = useContext(AuthContext);
  // this like come to visitprofile
  const { userType: userRouteType } = useLocalSearchParams();

  useEffect(() => {
    if (userType && userType !== "SIGNAL_PROVIDER" && userRouteType) {
      const timer = setTimeout(() => {
        router.replace("/");
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [userType, userRouteType]);

  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarIcon: ({ focused, size }) => {
          let iconName;
          if (route.name === "index") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "notification") {
            iconName = focused ? "notifications" : "notifications-outline";
            return (
              <NotificationBadge
                iconSize={size}
                iconColor={focused ? "black" : "#999"}
              />
            );
          } else if (route.name === "postsignal") {
            iconName = focused ? "add-circle" : "add-circle-outline";
          } else if (route.name === "search") {
            iconName = focused ? "search" : "search-outline";
          } else if (route.name === "profile") {
            iconName = focused ? "person" : "person-outline";
          }
          return <Ionicons name={iconName} size={size} color={"black"} />;
        },
      })}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
        }}
      />
      <Tabs.Screen
        name="notification"
        options={{
          title: "Notification",
        }}
      />

      {userType === "SIGNAL_PROVIDER" ? (
        <Tabs.Screen
          name="postsignal"
          options={{
            title: "",
            tabBarButton: () => <PostTabButton />,
          }}
        />
      ) : (
        <Tabs.Screen
          name="postsignal"
          options={{
            title: "",
            href: null,
          }}
        />
      )}

      <Tabs.Screen
        name="search"
        options={{
          title: "Search",
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
        }}
      />
    </Tabs>
  );
}

export const PostTabButton = () => {
  return (
    <TouchableOpacity
      onPress={() => router.push("/postsignal")}
      style={styles.container}
      activeOpacity={0.8}
    >
      <View style={styles.button}>
        <Ionicons
          name="add"
          color="#ffffff"
          style={{
            fontSize: RFValue(40), // Adjust the size as needed
          }}
        />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    top: -24,
    justifyContent: "center",

    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  button: {
    width: RFValue(52),
    height: RFValue(52),
    borderRadius: 50,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    borderWidth: RFValue(4),
    borderColor: "#ffffff",
  },
});
