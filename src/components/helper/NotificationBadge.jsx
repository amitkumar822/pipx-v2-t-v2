import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { router } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import apiService from "../../services/api";
import Toast from "react-native-toast-message";

export const NotificationBadge = ({ iconSize = 24, iconColor = "#666" }) => {
  const [notificationCount, setNotificationCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // useEffect(() => {
  //   fetchNotificationCount();

  //   // Set up interval to check for new notifications every 30 seconds
  //   const interval = setInterval(fetchNotificationCount, 30000);

  //   return () => clearInterval(interval);
  // }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        await fetchNotificationCount();
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
      }
    };

    fetchData();

    const interval = setInterval(() => {
      fetchData().catch((err) => console.error("Interval fetch failed:", err));
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const fetchNotificationCount = async () => {
    try {
      setLoading(true);
      const response = await apiService.getNotificationCount();

      if (response.statusCode === 200 && response.data) {
        setNotificationCount(response.data["Total count"] || 0);
      }
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to fetch notification count",
      });
      // Don't show error for notification count - fail silently
    } finally {
      setLoading(false);
    }
  };

  const handlePress = () => {
    router.push("/notification");
  };

  return (
    <Pressable style={styles.container} onPress={handlePress}>
      <MaterialIcons name="notifications" size={iconSize} color={iconColor} />
      {notificationCount > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {notificationCount > 99 ? "99+" : notificationCount.toString()}
          </Text>
        </View>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "relative",
    padding: 4,
  },
  badge: {
    position: "absolute",
    top: 0,
    right: 0,
    backgroundColor: "#FF3B30",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  badgeText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
  },
});
