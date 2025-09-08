import React, { useState, memo } from "react";
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { BottomSheetFlatList } from "@gorhom/bottom-sheet";
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
      keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
      className="min-w-[95%] h-full"
    >
      <View style={{ flex: 1, backgroundColor: "#fff" }}>
        <View
          style={{
            alignItems: "center",
            paddingVertical: 12,
            borderBottomWidth: 1,
            borderBottomColor: "#eee",
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: "bold" }}>Comments</Text>
        </View>
        {loading && <ActivityIndicator size="large" color="#888" />}
        {error && (
          <Text
            style={{ color: "gray" }}
            className="flex justify-center items-center w-full"
          >
            {error?.response?.message ||
              "An error occurred while fetching comments."}
          </Text>
        )}

        <BottomSheetFlatList
          data={allComments?.data || []}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderComment}
          contentContainerStyle={{
            padding: 12,
            paddingBottom: heightPercent(35), // Adjust for keyboard
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        />
      </View>
    </KeyboardAvoidingView>
  );
};

export default memo(CommentSheet);
