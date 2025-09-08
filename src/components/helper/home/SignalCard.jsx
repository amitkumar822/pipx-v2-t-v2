import {
  View,
  Text,
  Pressable,
  Alert,
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { format } from "date-fns";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { RFValue } from "react-native-responsive-fontsize";
import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { LineChart } from "react-native-gifted-charts";
import apiService from "../../../services/api";
import { AntDesign } from "@expo/vector-icons";
import {
  useCommentOnPost,
  useReportSignalProviderPost,
} from "@/src/hooks/useApi";
import Toast from "react-native-toast-message";
import ReportBlockModal from "../ReportBlockModel";
import AnimatedNumber from "react-native-animated-numbers";
import { AppImage } from "../../utils/AppImage";
import { router } from "expo-router";

const data = [{ value: 50 }, { value: 80 }, { value: 90 }, { value: 70 }];

export const SignalCard = memo(
  ({
    postId,
    userid,
    username,
    usertype,
    signaltype = "Scalping",
    currency_sign = "$",
    currency_name = "United States Dollar",
    direction = "Buy",
    entry,
    tp1,
    tp2,
    tp3,
    stop_loss,
    created_at,
    likeUnlikeStatus,
    openCommentModal,
    profile_image = "https://picsum.photos/seed/696/3000/2000",

    likeCount,
    dislikeCount,
    commentCount,
  }) => {
    // Optimized navigation
    const handlePress = useCallback(() => {
      if (!userid) return;

      router.push({
        pathname: "/visitprofile",
        params: {
          id: String(userid),
          userType: usertype,
          backRoutePath: "/",
        },
      });
    }, [router, userid, usertype]);

    // Memoized date formatting
    const formattedDate = useMemo(() => {
      const dateToFormat = created_at ? new Date(created_at) : new Date();
      return format(dateToFormat, "MM/dd/yyyy hh:mm aa");
    }, [created_at]);

    // Local state for tracking counts and status
    const [localLikeCount, setLocalLikeCount] = useState(likeCount || 0);
    const [localDislikeCount, setLocalDislikeCount] = useState(
      dislikeCount || 0
    );
    const [isLiked, setIsLiked] = useState(false);
    const [isDisliked, setIsDisliked] = useState(false);
    const [likeLoading, setLikeLoading] = useState(false);
    const [comment, setComment] = useState("");
    const [dislikeLoading, setDislikeLoading] = useState(false);

    // Initialize local state from props
    useEffect(() => {
      setLocalLikeCount(likeCount || 0);
      setLocalDislikeCount(dislikeCount || 0);
    }, [likeCount, dislikeCount]);

    // Like and Dislike Handlers
    useEffect(() => {
      if (likeUnlikeStatus === true) {
        setIsLiked(true);
        setIsDisliked(false);
      } else if (likeUnlikeStatus === false) {
        setIsLiked(false);
        setIsDisliked(true);
      } else {
        setIsLiked(false);
        setIsDisliked(false);
      }
    }, [likeUnlikeStatus]);

    const handleLike = async () => {
      if (likeLoading) return;

      setLikeLoading(true);

      // Save previous state for rollback on error
      const prevIsLiked = isLiked;
      const prevIsDisliked = isDisliked;
      const prevLikeCount = localLikeCount;
      const prevDislikeCount = localDislikeCount;

      // Optimistically update UI
      if (!isLiked) {
        // If post was previously disliked, decrement dislike count
        if (isDisliked) {
          setLocalDislikeCount((prev) => Math.max(0, prev - 1));
        }
        // Increment like count
        setLocalLikeCount((prev) => prev + 1);
        setIsLiked(true);
        setIsDisliked(false);
      } else {
        // User is unliking
        setLocalLikeCount((prev) => Math.max(0, prev - 1));
        setIsLiked(false);
      }

      try {
        const response = await apiService.likePost(postId);

        if (response.statusCode !== 201) {
          // If API failed, rollback to previous state
          setIsLiked(prevIsLiked);
          setIsDisliked(prevIsDisliked);
          setLocalLikeCount(prevLikeCount);
          setLocalDislikeCount(prevDislikeCount);
          Toast.show({
            type: "error",
            text1: "Failed to update like status",
          });
        }
      } catch (error) {
        // On error, rollback to previous state
        setIsLiked(prevIsLiked);
        setIsDisliked(prevIsDisliked);
        setLocalLikeCount(prevLikeCount);
        setLocalDislikeCount(prevDislikeCount);

        Toast.show({
          type: "error",
          text1: "Network error",
          text2: "Failed to like post",
        });
      } finally {
        setLikeLoading(false);
      }
    };

    const handleDisLike = async () => {
      if (dislikeLoading) return;

      setDislikeLoading(true);

      // Save previous state for rollback on error
      const prevIsLiked = isLiked;
      const prevIsDisliked = isDisliked;
      const prevLikeCount = localLikeCount;
      const prevDislikeCount = localDislikeCount;

      // Optimistically update UI
      if (!isDisliked) {
        // If post was previously liked, decrement like count
        if (isLiked) {
          setLocalLikeCount((prev) => Math.max(0, prev - 1));
        }
        // Increment dislike count
        setLocalDislikeCount((prev) => prev + 1);
        setIsDisliked(true);
        setIsLiked(false);
      } else {
        // User is undoing dislike
        setLocalDislikeCount((prev) => Math.max(0, prev - 1));
        setIsDisliked(false);
      }

      try {
        const response = await apiService.dislikePost(postId);

        if (response.statusCode !== 201) {
          // If API failed, rollback to previous state
          setIsLiked(prevIsLiked);
          setIsDisliked(prevIsDisliked);
          setLocalLikeCount(prevLikeCount);
          setLocalDislikeCount(prevDislikeCount);
          Toast.show({
            type: "error",
            text1: "Failed to update dislike status",
          });
        }
      } catch (error) {
        // On error, rollback to previous state
        setIsLiked(prevIsLiked);
        setIsDisliked(prevIsDisliked);
        setLocalLikeCount(prevLikeCount);
        setLocalDislikeCount(prevDislikeCount);

        Toast.show({
          type: "error",
          text1: "Network error",
          text2: "Failed to dislike post",
        });
      } finally {
        setDislikeLoading(false);
      }
    };

    // Comment Hook
    const { mutate: commentOnPost } = useCommentOnPost();

    const [commentLoading, setCommentLoading] = useState(false);
    const commentInputRef = useRef(null);

    const [localCommentCount, setLocalCommentCount] = useState(
      commentCount || 0
    );

    // Initialize local comment count from props
    useEffect(() => {
      setLocalCommentCount(commentCount || 0);
    }, [commentCount]);

    const handleComment = useCallback(() => {
      if (commentLoading || !comment.trim()) return;

      setCommentLoading(true);

      // Save the current comment count for rollback
      const prevCommentCount = localCommentCount;

      // Optimistically update UI
      setLocalCommentCount((prev) => prev + 1);

      // Call the comment API
      commentOnPost(
        { postId, comment },
        {
          onSuccess: () => {
            setCommentLoading(false);
            setComment(""); // ✅ Clear comment
          },
          onError: (error) => {
            console.error("Error adding comment:", error);
            setCommentLoading(false);
            // Roll back the comment count
            setLocalCommentCount(prevCommentCount);

            Toast.show({
              type: "error",
              text1: "Failed to add comment",
              text2: error?.response?.data?.message || "Please try again",
            });
          },
        }
      );
    }, [commentLoading, comment, localCommentCount, commentOnPost, postId]);

    // Report Signal Provider Post By User Hook
    const { mutate: reportPost } = useReportSignalProviderPost();

    const [visible, setVisible] = useState(false);
    const [modalType, setModalType] = useState("");

    const handleReportPost = () => {
      reportPost(
        { postId },
        {
          onSuccess: () => {
            setModalType("success");
          },
          onError: (error) => {
            Toast.show({
              type: "error",
              text1: "Failed to report post",
            });
          },
        }
      );
    };

    return (
      <View className="w-full bg-[#EBF5FF] rounded-xl p-2 mb-3">
        {/* Header */}
        <View className="flex-row items-center justify-between mb-3">
          {/* Left Side: Profile Image + Info */}
          <TouchableOpacity
            onPress={handlePress}
            className="flex-row items-center gap-2"
          >
            <AppImage
              uri={profile_image}
              contentFit="cover"
              style={{ width: 34, height: 34, borderRadius: 24 }}
            />

            <View>
              <Text className="font-bold text-sm text-black">
                @{username || "unknown_user"}
              </Text>
              <Text className="text-gray-400 text-xs">
                {usertype === "SIGNAL_PROVIDER" ? "Signal Provider" : "User"}
              </Text>
            </View>
          </TouchableOpacity>

          {/* Right Side: 3-dot button */}
          <Pressable
            onPress={() => {
              setVisible(true);
              setModalType("postReport");
            }}
            className="p-2"
          >
            <MaterialIcons name="more-vert" size={20} color="#666" />
          </Pressable>
        </View>

        {/* Feed */}
        <View className="bg-[#F9FAFB] rounded-xl p-3">
          <Text className="text-[#007AFF] font-bold text-base mb-2">
            Signal Feed
          </Text>

          <View className="bg-white rounded-xl p-3">
            {/* Header Row */}
            <View className="flex-row justify-between items-center mb-3">
              <View className="flex-row items-center">
                <Text className="font-bold text-base text-black">
                  {currency_name} ({currency_sign})
                </Text>
                <Text className="text-green-500 font-bold text-base ml-2 uppercase">
                  {direction}
                </Text>
              </View>
              <Text className="bg-[#007AFF1A] px-3 py-1 rounded-md text-[#007AFF] font-bold text-xs">
                {signaltype}
              </Text>
            </View>

            {/* Data Left/Right */}
            <View className="flex-row justify-between items-start">
              {/* Left Side */}
              <View className="w-[45%] space-y-2">
                <View className="flex-row justify-between">
                  <Text>Entry Price</Text>
                  <Text>{entry || "N/A"}</Text>
                </View>
                {tp1 && (
                  <View className="flex-row justify-between">
                    <Text>TP1</Text>
                    <Text>{tp1}</Text>
                  </View>
                )}
                {tp2 && (
                  <View className="flex-row justify-between">
                    <Text>TP2</Text>
                    <Text>{tp2}</Text>
                  </View>
                )}
                {tp3 && (
                  <View className="flex-row justify-between">
                    <Text>TP3</Text>
                    <Text>{tp3}</Text>
                  </View>
                )}
                {stop_loss && (
                  <View className="flex-row justify-between">
                    <Text>Stop Loss</Text>
                    <Text>{stop_loss}</Text>
                  </View>
                )}
              </View>

              {/* Right Side */}
              <View className="w-[50%] items-center justify-center">
                <View className="w-full flex-col justify-end mb-2">
                  <Text
                    className="text-base font-medium text-black"
                    style={{ fontSize: RFValue(10.2) }}
                  >
                    Date & Time:
                  </Text>
                  <Text
                    className="text-[#007AFF] font-bold mt-1"
                    style={{
                      fontSize: RFValue(10),
                      flexShrink: 1,
                      flexWrap: "wrap",
                    }}
                  >
                    {formattedDate}
                  </Text>
                </View>

                <View className="w-[80%] h-20 border-2 border-[#C2E0FF] rounded-md overflow-hidden">
                  <LineChart
                    data={data}
                    spacing={30}
                    hideDataPoints
                    thickness={1}
                    hideRules={false}
                    hideYAxisText
                    yAxisColor="#E5E4E2A9"
                    showVerticalLines
                    verticalLinesColor="#E5E4E2A9"
                    noOfVerticalLines={4}
                    xAxisColor="#E5E4E2"
                    color="#0BA5A4"
                    height={70}
                    rulesType="solid"
                  />
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Like, Dislike & Comment Section */}
        <View className="flex-row mt-3 items-center gap-2 px-3 py-2">
          {/* Like */}
          <Pressable onPress={handleLike} disabled={likeLoading}>
            <AntDesign
              name="like1"
              color={isLiked ? "#007AFD" : "#999"}
              style={{
                fontSize: RFValue(19),
                flexShrink: 1,
                flexWrap: "wrap",
              }}
            />
          </Pressable>

          {/* Dislike */}
          <Pressable onPress={handleDisLike} disabled={dislikeLoading}>
            <AntDesign
              name="dislike1"
              // className="bg-[#d98068]"
              color={isDisliked ? "#d98068" : "#999"}
              style={{
                fontSize: RFValue(19),
                transform: [{ scaleX: -1 }],
              }}
            />
          </Pressable>

          {/* Comment Input Box */}
          <View className="flex-row items-center flex-1 bg-white border border-gray-300 rounded-xl px-3 py-1">
            {/* Comment Icon */}
            <MaterialIcons name="comment" size={18} color="#888" />

            {/* Input */}
            <TextInput
              ref={commentInputRef}
              className="flex-1 text-sm ml-2 text-gray-800"
              placeholder="add a comment"
              placeholderTextColor="#aaa"
              value={comment}
              onChangeText={setComment}
              onSubmitEditing={comment.trim() ? handleComment : undefined}
              returnKeyType="send"
              blurOnSubmit={true}
              multiline={false}
            />

            {/* Send Button - only show when there's text */}
            {comment.trim().length > 0 && (
              <Pressable
                onPress={handleComment}
                className="ml-2"
                disabled={commentLoading}
                hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
              >
                {commentLoading ? (
                  <ActivityIndicator size="small" color="#007AFF" />
                ) : (
                  <MaterialIcons name="send" size={20} color="#007AFF" />
                )}
              </Pressable>
            )}
          </View>
        </View>

        {/* Action Buttons */}
        <View className="flex-row justify-between items-center mt-3 px-1">
          {/* Like */}
          <View className="flex-row items-center gap-x-1">
            <MaterialIcons
              name="thumb-up-alt"
              size={RFValue(15)}
              color="#007AFF"
            />
            <View className="flex-row items-center justify-center flex-wrap">
              <Text className="text-blue-600" style={{ fontSize: RFValue(9) }}>
                Liked by{" "}
              </Text>
              <AnimatedNumber
                includeComma={false}
                animationDuration={300}
                animateToNumber={localLikeCount}
                fontStyle={{
                  fontSize: RFValue(9),
                  color: "#007AFF",
                }}
              />
              <Text className="text-blue-600" style={{ fontSize: RFValue(9) }}>
                {" "}
                people
              </Text>
            </View>
          </View>

          {/* Dislike */}
          <View className="flex-row items-center gap-x-1">
            <MaterialIcons
              name="thumb-down-alt"
              size={RFValue(15)}
              color="#BDBDBD"
            />
            <View className="flex-row flex-wrap items-center">
              <Text className="text-gray-500" style={{ fontSize: RFValue(9) }}>
                Disliked by{" "}
              </Text>
              <AnimatedNumber
                includeComma={false}
                animationDuration={300}
                animateToNumber={localDislikeCount}
                fontStyle={{
                  fontSize: RFValue(9),
                  color: "#9E9E9E",
                }}
              />
              <Text className="text-gray-500" style={{ fontSize: RFValue(9) }}>
                {" "}
                people
              </Text>
            </View>
          </View>

          {/* Comments */}
          <TouchableOpacity
            className="flex-row items-center gap-x-1"
            onPress={() => {
              openCommentModal(postId);
            }}
          >
            <MaterialIcons name="comment" size={RFValue(15)} color="#666" />
            <View className="flex-row items-center flex-wrap">
              <AnimatedNumber
                includeComma={false}
                animationDuration={300}
                animateToNumber={localCommentCount}
                fontStyle={{
                  fontSize: RFValue(9),
                  color: "#4B5563",
                }}
              />
              <Text className="text-gray-600" style={{ fontSize: RFValue(9) }}>
                {" "}
                comments
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Time ago */}
        {/* <View className="flex-row items-center mt-1 px-1">
        <Feather name="clock" size={14} color="#9CA3AF" />
        <Text className="text-gray-400 text-xs ml-1">2 hours ago</Text>
      </View> */}

        <ReportBlockModal
          visible={visible}
          userName={username}
          type={modalType}
          setModalType={setModalType}
          onClose={() => setVisible(false)}
          onAction={handleReportPost}
        />
      </View>
    );
  }
);
