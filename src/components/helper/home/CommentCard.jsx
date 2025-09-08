import React, { memo, useEffect, useState } from "react";
import {
  View,
  Text,
  Pressable,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
  FlatList,
} from "react-native";
import AnimatedNumber from "react-native-animated-numbers";
import { Ionicons } from "@expo/vector-icons";
import { RFValue } from "react-native-responsive-fontsize";
import { useCreateReplyToComment, useLikeComment, useDeleteComment } from "@/src/hooks/useApi";
import DateFormatter from "../../utils/DateFormatter";
import Toast from "react-native-toast-message";
import SubCommentCard from "./SubCommentCard";
import { useMemo } from "react";
import { AppImage } from "../../utils/AppImage";

const CommentCard = ({
  item,
  activeReplyTarget,
  setActiveReplyTarget,
  replyCommentMessage,
  isLoading = false,
  replyText,
  setReplyText,
}) => {
  // State to manage sub-reply target
  const [activeSubReplyTarget, setActiveSubReplyTarget] = useState("");

  const handleReplyPress = (type, id) => {
    if (activeReplyTarget?.id === id && activeReplyTarget?.type === type) {
      setActiveReplyTarget(null);
      setActiveSubReplyTarget(""); // Clear sub-reply target when closing main reply
    } else {
      setActiveReplyTarget({ type, id });
    }
    setReplyText("");
  };

  // Create reply to comment mutation
  const { mutate: replyToComment } = useCreateReplyToComment();
  // State to manage reply loading
  const [replyLoading, setReplyLoading] = useState(false);

  // Handle Reply Comment
  const handleSendReply = () => {
    const trimmedText = replyText.trim();
    if (!trimmedText) return;

    if (!activeReplyTarget?.id) {
      Alert.alert("Error", "No comment selected for reply.");
      return;
    }

    const commentId = activeSubReplyTarget
      ? activeSubReplyTarget
      : activeReplyTarget.id;
    setReplyLoading(true);
    replyToComment(
      {
        parent: commentId,
        comment: trimmedText,
      },
      {
        onSuccess: () => {
          setReplyText("");
          setReplyLoading(false);
        },
        onError: (error) => {
          setReplyLoading(false);
          Toast.show({
            type: "error",
            text1: "Failed to send reply.",
            text2: error.message || "Please try again later.",
          });
        },
      }
    );
  };

  // Handle like mutation hook
  const { mutate: likeComment } = useLikeComment();
  const [likeTargetId, setLikeTargetId] = useState("");

  // Handle delete comment mutation hook
  const { mutate: deleteComment, isLoading: isDeleting } = useDeleteComment();

  // Track local like count for the main comment
  const [localLikeCount, setLocalLikeCount] = useState(item?.like_count || 0);

  // Update local like count when the item changes
  useEffect(() => {
    setLocalLikeCount(item?.like_count || 0);
  }, [item?.like_count]);

  // Like functionality with optimistic UI updates
  const handleLike = (commentId) => {
    setLikeTargetId(commentId);

    // If this is the current comment being liked
    if (commentId === item?.id) {
      // Optimistically update UI
      const isCurrentlyLiked = item?.is_like;
      setLocalLikeCount((prev) =>
        isCurrentlyLiked ? Math.max(0, prev - 1) : prev + 1
      );

      // Update the item's like state optimistically
      item.is_like = !isCurrentlyLiked;
    }

    likeComment(
      { commentId },
      {
        onSuccess: (res) => {
          setLikeTargetId("");
        },
        onError: (error) => {
          setLikeTargetId("");

          // Revert optimistic update if this is the current comment
          if (commentId === item?.id) {
            const isCurrentlyLiked = item?.is_like;
            setLocalLikeCount((prev) =>
              isCurrentlyLiked ? prev - 1 : prev + 1
            );
            item.is_like = !isCurrentlyLiked;
          }

          Toast.show({
            type: "error",
            text1: "Failed to like comment.",
            text2: error.message || "Please try again later.",
          });
        },
      }
    );
  };

  const handlePress = (id) => {
    console.log("id", id);
  };

  // Handle long press to show delete alert
  const handleLongPress = (commentId) => {
    Alert.alert(
      "Delete Comment",
      "Are you sure you want to delete this comment?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "OK",
          style: "destructive",
          onPress: () => handleDeleteComment(commentId),
        },
      ]
    );
  };

  // Handle delete comment
  const handleDeleteComment = (commentId) => {
    deleteComment(
      { commentId },
      {
        onSuccess: () => {
         
        },
        onError: (error) => {
          Toast.show({
            type: "error",
            text1: "Failed to delete comment",
            text2: error?.message || "Please try again later",
          });
        },
      }
    );
  };

  return (
    <View className="mt-4">
      {/* Main Comment */}
      <View className="flex-row gap-3">
        <AppImage
          uri={item?.user?.profile_image}
          contentFit="cover"
          style={{ width: 34, height: 34, borderRadius: 24 }}
        />
        <View className="flex-1">
          <Pressable
            onLongPress={() => handleLongPress(item?.id)}
            delayLongPress={500}
          >
            <View className="flex-row justify-between items-start">
              <Text
                className="font-semibold"
                style={{
                  fontSize: RFValue(13),
                }}
              >
                {item?.user?.first_name + " " + item?.user?.last_name}
              </Text>
              <View>
                <TouchableOpacity
                  onPress={() => handleLike(item?.id)}
                  className="items-center"
                >
                  <Ionicons
                    name="heart"
                    size={RFValue(16)}
                    color={item?.is_like ? "#FF0000" : "#888"}
                  />
                  <AnimatedNumber
                    includeComma={false}
                    animationDuration={300}
                    animateToNumber={localLikeCount}
                    fontStyle={{
                      fontSize: RFValue(10),
                      color: "#888",
                    }}
                  />
                </TouchableOpacity>

                <Text className="text-[11px] text-gray-500">
                  <DateFormatter date={item?.created_at} />
                </Text>
              </View>
            </View>

            <Text
              className="-mt-6 text-[#333]"
              style={{
                fontSize: RFValue(11.5),
              }}
            >
              {item.comment}
            </Text>
          </Pressable>

          {/* Reply Button */}
          <View className="flex-row mt-2 gap-5">
            {activeReplyTarget?.id === item.id && isLoading ? (
              <ActivityIndicator size="small" color="#007AFF" />
            ) : (
              <Pressable onPress={() => handleReplyPress("main", item.id)}>
                <View className="flex-row items-center">
                  <Text
                    className="text-[#007AFF]"
                    style={{
                      fontSize: RFValue(10.5),
                    }}
                  >
                    Reply
                  </Text>

                  {item?.reply_count > 0 && (
                    <>
                      <Text
                        className="text-[#007AFF]"
                        style={{ fontSize: RFValue(10.5) }}
                      >
                        {" ("}
                      </Text>
                      <AnimatedNumber
                        includeComma={false}
                        animationDuration={300}
                        animateToNumber={item.reply_count}
                        fontStyle={{
                          fontSize: RFValue(10.5),
                          color: "#007AFF",
                        }}
                      />
                      <Text
                        className="text-[#007AFF]"
                        style={{ fontSize: RFValue(10.5) }}
                      >
                        {")"}
                      </Text>
                    </>
                  )}
                </View>
              </Pressable>
            )}
          </View>

          {/* Comment Input box */}
          {activeReplyTarget?.type === "main" &&
            activeReplyTarget.id === item.id &&
            !isLoading &&
            activeSubReplyTarget === "" && (
              <View className="flex-row justify-center items-center gap-2 mt-3 ml-1">
                <AppImage
                  uri={item?.user?.profile_image}
                  contentFit="cover"
                  style={{ width: 34, height: 34, borderRadius: 24 }}
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

                  {/* Send Button (inside input box, bottom-right corner) */}
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

          {/* Replies */}
          {activeReplyTarget?.id === item?.id &&
            replyCommentMessage?.data &&
            Array.isArray(replyCommentMessage?.data) &&
            replyCommentMessage?.data.length > 0 && (
              <View className="mt-2">
                {replyCommentMessage.data.map((reply) => (
                  <SubCommentCard
                    key={reply.id}
                    reply={reply}
                    setActiveSubReplyTarget={setActiveSubReplyTarget}
                    replyText={replyText}
                    setReplyText={setReplyText}
                    activeSubReplyTarget={activeSubReplyTarget}
                    handleSendReply={handleSendReply}
                    handleLike={handleLike}
                    likeTargetId={likeTargetId}
                    handleLongPress={handleLongPress}
                  />
                ))}
              </View>
            )}
        </View>
      </View>
    </View>
  );
};
export default memo(CommentCard);
