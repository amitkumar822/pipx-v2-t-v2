import React, { useState, memo } from "react";
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  ActivityIndicator,
  FlatList,
} from "react-native";
import CommentCard from "./CommentCard";
import {
  useGetReplyCommentMessage,
  useGetSignalPostComments,
} from "@/src/hooks/useApi";

const { height } = Dimensions.get("window");
const heightPercent = (percent) => (height * percent) / 100;

const CommentSheet = ({ signalPostId }) => {
  // Fetch all comments when signalPostId changes
  const {
    data: allComments,
    isLoading: loading,
    error,
  } = useGetSignalPostComments(signalPostId, {
    enabled: !!signalPostId,
  });

  const [activeReplyTarget, setActiveReplyTarget] = useState(null);
  const [replyText, setReplyText] = useState("");

  // Get Reply Comment Message for the active comment
  const { data: replyCommentMessage, isLoading: isReplyLoading } =
    useGetReplyCommentMessage(activeReplyTarget?.id, {
      enabled: !!activeReplyTarget?.id,
    });

  const renderComment = ({ item }) => (
    <CommentCard
      item={item}
      activeReplyTarget={activeReplyTarget}
      setActiveReplyTarget={setActiveReplyTarget}
      replyCommentMessage={replyCommentMessage}
      isLoading={isReplyLoading}
      replyText={replyText}
      setReplyText={setReplyText}
    />
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
    >
      <View style={{ flex: 1, backgroundColor: "#fff" }}>
        {loading && (
          <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <ActivityIndicator size="large" color="#888" />
          </View>
        )}
        {error && (
          <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <Text style={{ color: "gray", textAlign: "center" }}>
              {error?.response?.message ||
                "An error occurred while fetching comments."}
            </Text>
          </View>
        )}

        {!loading && !error && (
          <FlatList
            data={allComments?.data || []}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderComment}
            contentContainerStyle={{
              padding: 12,
              paddingBottom: heightPercent(20), // Adjust for keyboard
            }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </KeyboardAvoidingView>
  );
};

export default memo(CommentSheet);
