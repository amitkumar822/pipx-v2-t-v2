import {
  Text,
  StyleSheet,
  View,
  ScrollView,
  ActivityIndicator,
  FlatList,
} from "react-native";
import React, { useEffect, useState } from "react";
import NotificationCard from "../helper/notification/NotificationCard";
import apiService from "../../services/api";
import { BackHeader } from "../helper/auth/BackHeader";
import NoNotifications from "../helper/animation/NoFoundNotification";
import Toast from "react-native-toast-message";

export default function NotificationScreen() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await apiService.getNotifications();

      if (response.statusCode === 200 && response.data) {
        setNotifications(response.data);
      } else {
        setNotifications([]);
      }
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Error fetching notifications",
        text2: error.message || "Something went wrong",
      });
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const renderNotification = ({ item }) => (
    <NotificationCard key={item.id} notification={item} />
  );

  const renderEmptyComponent = () => (
    <View className="min-w-full">
      <NoNotifications />
    </View>
  );

  return (
    <View style={styles.container} className="bg-gray-50">
      <BackHeader
        style={{ backgroundColor: "#F8FAFC" }}
      />

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading notifications...</Text>
        </View>
      ) : (
        <>
          <FlatList
            data={notifications}
            renderItem={renderNotification}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.notifcontainer}
            ListEmptyComponent={renderEmptyComponent}
            showsVerticalScrollIndicator={false}
            initialNumToRender={10}
            maxToRenderPerBatch={10}
            windowSize={5}
            removeClippedSubviews={true}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "flex-start",
    // backgroundColor: "#FFFFFF",
  },
  notifcontainer: {
    flexGrow: 1,
    width: "100%",
    paddingHorizontal: 8,
    paddingVertical: 10,
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-start",
    // alignItems: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
});
