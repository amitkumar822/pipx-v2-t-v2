import {
  View,
  Text,
  Pressable,
  TouchableOpacity,
  TextInput,
  replyLoading,
  ActivityIndicator,
} from "react-native";
import React, { memo, useMemo, useState } from "react";
import DateFormatter from "../../utils/DateFormatter";
import { RFValue } from "react-native-responsive-fontsize";
import { Ionicons } from "@expo/vector-icons";
import AnimatedNumber from "react-native-animated-numbers";
import { AppImage } from "../../utils/AppImage";

const SubCommentCard = ({
  reply,
  setActiveSubReplyTarget,
  replyText,
  setReplyText,
  activeSubReplyTarget,
  handleSendReply,
  handleLike,
  likeTargetId,
  handleLongPress,
}) => {
  const isLiking = likeTargetId === reply?.id;

  if (!reply) {
    return null;
  }

  const replyLength = useMemo(() => {
    return reply?.replies?.length || 0;
  }, [reply?.replies]);



  return (
    <View key={reply.id} className="mt-3 ml-1">
      <View className="flex-row gap-2.5">
        <AppImage
          uri={reply?.user?.profile_image || reply?.image}
          contentFit="cover"
          style={{
            width: 24,
            height: 24,
            borderRadius: 12,
          }}
        />
        <View className="flex-1">
          <Pressable onLongPress={() => handleLongPress(reply.id)} delayLongPress={500}>
            <View className="flex-row justify-between">
              <Text className="font-semibold" style={{ fontSize: RFValue(13) }}>
                {reply.user.first_name} {reply.user.last_name}
              </Text>
              <Text className=" text-gray-500" style={{ fontSize: RFValue(11) }}>
                <DateFormatter date={reply?.created_at} />
              </Text>
            </View>
            <Text
              className="mt-0.5 text-[#444]"
              style={{ fontSize: RFValue(12) }}
            >
              {reply.comment}
            </Text>

            <View className="flex-row mt-1.5 gap-5">
              <Pressable
                onPress={() => {
                  setActiveSubReplyTarget(reply.id);
                  setReplyText("");
                }}
              >
                <View className="flex-row items-center">
                  <Text
                    className="text-[#007AFF]"
                    style={{ fontSize: RFValue(10.5) }}
                  >
                    Reply (
                  </Text>
                  <AnimatedNumber
                    includeComma={false}
                    animationDuration={300}
                    animateToNumber={replyLength || 0}
                    fontStyle={{
                      fontSize: RFValue(10.5),
                      color: "#007AFF",
                    }}
                  />
                  <Text
                    className="text-[#007AFF]"
                    style={{ fontSize: RFValue(10.5) }}
                  >
                    )
                  </Text>
                </View>
              </Pressable>

              {isLiking ? (
                <>
                  <ActivityIndicator size={16} color="#007AFF" />
                </>
              ) : (
                <TouchableOpacity
                  onPress={() => {
                    handleLike(reply.id);
                  }}
                  className="flex-row items-center gap-1"
                >
                  <Ionicons
                    name="heart"
                    size={RFValue(15)}
                    color={reply?.is_like ? "#FF3B30" : "gray"}
                  />
                  <Text className="text-xs text-gray-500">
                    {reply.like_count}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </Pressable>

          {/* Reply Input box */}
          {activeSubReplyTarget === reply.id && (
            <View className="flex-row justify-center items-center gap-2 mt-3 ml-2">
              <AppImage
                uri="https://picsum.photos/40/40?replying"
                contentFit="cover"
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 12,
                  marginTop: 4,
                }}
              />

              <View
                className="flex-1 px-3 py-1.5 relative justify-center"
                style={{
                  backgroundColor: "#F0F0F0",
                  borderRadius: 50,
                }}
              >
                <TextInput
                  value={replyText}
                  onChangeText={setReplyText}
                  placeholder="Write a reply..."
                  multiline
                  className="text-sm pr-10"
                  style={{ maxHeight: 100, color: "#000" }}
                />

                <Pressable
                  onPress={handleSendReply}
                  className="absolute right-2 bottom-3 p-2 rounded-full bg-[#007AFF]"
                  style={{ elevation: 2 }}
                  disabled={replyLoading}
                >
                  {replyLoading ? (
                    <ActivityIndicator size={16} color="#fff" />
                  ) : (
                    <Ionicons name="send" size={16} color="#fff" />
                  )}
                </Pressable>
              </View>
            </View>
          )}

          {/* Replies inside reply */}
          {reply.replies?.length > 0 &&
            reply.replies.map((subReply) => (
              <Pressable onLongPress={() => handleLongPress(subReply.id)} delayLongPress={500}>
                <View key={subReply.id} className="mt-3 ml-2">
                  <View className="flex-row gap-2.5 bg-[#F9F9F9] rounded-xl p-3 shadow-sm border border-gray-100">
                    {/* Avatar */}
                    <AppImage
                      uri={subReply.user?.profile_image}
                      contentFit="cover"
                      style={{
                        width: 34,
                        height: 34,
                      }}
                    />

                    {/* Reply Content */}
                    <View className="flex-1">
                      <View className="flex-row justify-between items-center">
                        <Text className="font-semibold text-[13px] text-gray-900">
                          {subReply.user.first_name} {subReply.user.last_name}
                        </Text>
                        <Text
                          className="text-gray-500"
                          style={{ fontSize: RFValue(11) }}
                        >
                          <DateFormatter date={subReply?.created_at} />
                        </Text>
                      </View>

                      <Text className="mt-1 text-[13px] text-[#333] leading-[18px]">
                        {subReply.comment}
                      </Text>
                    </View>
                  </View>
                </View>
              </Pressable>
            ))}
        </View>
      </View>
    </View>
  );
};

export default memo(SubCommentCard);
