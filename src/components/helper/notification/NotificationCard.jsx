import React from "react";
import { View, Text, Pressable, Image } from "react-native";
import { RFValue } from "react-native-responsive-fontsize";
import { format } from "date-fns";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { AppImage } from "../../utils/AppImage";

const NotificationCard = ({ notification }) => {
  const formatTime = (dateString) => {
    try {
      return format(new Date(dateString), "h:mm a");
    } catch {
      return "Just now";
    }
  };

  // Notification metadata
  const sender = notification?.sender || "PipX Team";
  const content = notification?.description || notification?.message || "New notification";
  const isRepost = notification?.isRepost || false;
  const hasAttachment = notification?.attachment || false;

  return (
    <Pressable className="min-w-full bg-gray-50 px-4 py-3 border-b border-gray-300">
      {/* Header with avatar and sender info */}
      <View className="flex-row items-start w-full">
        {/* Avatar */}
        <View className="w-10 h-10 rounded-full bg-blue-50 mr-3 flex items-center justify-center overflow-hidden">
          {notification?.avatar ? (
            <AppImage
              uri={notification.avatar}
              contentFit="cover"
              style={{ width: "100%", height: "100%" }}
            />
          ) : (
            <MaterialIcons name="person" size={RFValue(16)} color="#0073b1" />
          )}
        </View>
        
        {/* Sender and time */}
        <View className="flex-1">
          <View className="flex-row items-center flex-wrap">
            <Text className="font-semibold text-gray-900" style={{ fontSize: RFValue(14) }}>
              {sender}
            </Text>
            {isRepost && (
              <Text className="text-gray-500 ml-1" style={{ fontSize: RFValue(12) }}>
                reposted
              </Text>
            )}
            <Text className="text-gray-500 ml-1" style={{ fontSize: RFValue(12) }}>
              • {formatTime(notification?.created_at)}
            </Text>
          </View>
        </View>
        
        {/* Options button */}
        <MaterialIcons name="more-vert" size={RFValue(16)} color="#666" />
      </View>
      
      {/* Notification content */}
      <View className="mb-1 -mt-3 mx-[52px]">
        <Text className="text-gray-800 mb-1" style={{ fontSize: RFValue(14) }}>
          {content}
        </Text>
        
        {/* Attachment preview if exists */}
        {hasAttachment && (
          <View className="border border-gray-200 rounded-lg p-3 mt-2">
            <View className="flex-row">
              <View className="w-10 h-10 bg-gray-100 rounded mr-3" />
              <View>
                <Text className="font-medium text-gray-900" style={{ fontSize: RFValue(12) }}>
                  {notification.attachment.title || "Attachment"}
                </Text>
                <Text className="text-gray-500" style={{ fontSize: RFValue(10) }}>
                  {notification.attachment.source || "PipX"}
                </Text>
              </View>
            </View>
          </View>
        )}
      </View>

    </Pressable>
  );
};

export default NotificationCard;
