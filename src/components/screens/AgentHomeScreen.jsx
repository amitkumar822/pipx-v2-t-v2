import {
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  FlatList,
  Pressable,
  Modal,
} from "react-native";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { SignalCard } from "../helper/home/SignalCard";
import apiService from "../../services/api";
import { useUserProvider } from "@/src/context/user/userContext";
import { GestureHandlerRootView, PanGestureHandler, ScrollView, State } from "react-native-gesture-handler";
import CommentSheet from "../helper/home/CommentSheet";
import Toast from "react-native-toast-message";
import { EndOfListComponent } from "../EndOfListComponent";
import SkeletonSignalPostCard from "../helper/home/SkeletonSignalPostCard";

export const AgentHomeScreen = ({
  signalPostsData,
  signalPostsError,
  isLoading = false,
  isFetching = false,
  refetch,
  page,
  setPage,
  isLoadingMore,
  hasNextPage,
  handleLoadMore,
}) => {
  // =========== Comment Modal Open Functionality ===================
  const [modalVisible, setModalVisible] = useState(false);
  const [signalPostId, setSignalPostId] = useState("");

  const openCommentModal = (postId) => {
    setSignalPostId(postId);
    setModalVisible(true);
  };

  const closeCommentModal = () => {
    setModalVisible(false);
    setSignalPostId("");
  };

  // =========== Simple Swipe Gesture Handler ===================
  const onGestureEvent = useCallback((event) => {
    const { translationY, state, velocityY } = event.nativeEvent;

    if (state === State.END) {
      const threshold = 100; // Distance threshold
      const velocityThreshold = 500; // Velocity threshold

      // Check if should close based on distance OR velocity
      const shouldClose = translationY > threshold || velocityY > velocityThreshold;

      if (shouldClose) {
        closeCommentModal();
      }
    }
  }, []);

  // =========== End Enhanced Swipe Gesture Handler ===================

  //^ ===== Reset currency data on Agent screen mount =====
  const { setCurrencyAssetDetails } = useUserProvider();

  useEffect(() => {
    setCurrencyAssetDetails([]);
  }, []);
  //^ ===== End: Reset currency data on Agent screen mount =====

  const [refreshing, setRefreshing] = useState(false);

  // This will hold the like/unlike status for each post
  const [likeUnlikeData, setLikeUnlikeData] = useState([]);

  // Get Like Unlike and Dislike functionality - moved up and memoized
  const fetchLikeUnlike = async () => {
    try {
      const response = await apiService.likeGet();
      if (response.statusCode === 200) {
        setLikeUnlikeData(response?.data);
      }
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error.message || "Failed to fetch like/unlike data",
      });
    }
  };

  useEffect(() => {
    fetchLikeUnlike();
  }, []);

  // Create a map of post IDs to like/unlike status
  const likeMap = useMemo(() => {
    const map = {};
    likeUnlikeData.forEach((item) => {
      map[item.post] = item.is_like; // true (like), false (dislike)
    });
    return map;
  }, [likeUnlikeData]);

  // Render each signal post
  const renderSignalPost = useCallback(
    ({ item }) => {
      const postLikeStatus = likeMap[item.id];
      return (
        <SignalCard
          key={item.id}
          postId={item.id}
          userid={item.signal_provider?.id}
          username={item.signal_provider?.username}
          usertype={item.signal_provider?.user_type}
          signaltype={item.signal_type}
          currency_name={item.asset?.name || "Unknown Asset"}
          direction={item.direction}
          entry={item.entry}
          tp1={item.tp1}
          tp2={item.tp2}
          tp3={item.tp3}
          stop_loss={item.stop_loss}
          caption={item.caption}
          description={item.description}
          created_at={item.created_at}
          profile_image={
            item?.signal_provider?.image || item.signal_provider?.profile_image
          }
          likeUnlikeStatus={postLikeStatus}
          openCommentModal={openCommentModal}
          likeCount={item.like_count}
          dislikeCount={item.dislike_count}
          commentCount={item.post_comment_count}
        />
      );
    },
    [likeMap]
  );

  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>No signal posts found</Text>
      <Text style={styles.emptySubText}>Check back later for new signals</Text>
    </View>
  );

  // Handle pull-to-refresh FlatList
  const handleRefresh = async () => {
    try {
      setRefreshing(true); // Start refresh spinner
      setPage(1); // Reset to first page

      await refetch();
      await fetchLikeUnlike();
    } finally {
      setRefreshing(false); // Stop spinner
    }
  };

  // Optimized handleLoadMore with protection against auto-triggering
  const handleLoadMoreOptimized = useCallback(() => {
    if (!isLoadingMore && hasNextPage && signalPostsData?.length) {
      handleLoadMore();
    }
  }, [isLoadingMore, hasNextPage, signalPostsData, handleLoadMore]);

  // Render skeleton loading cards when initial loading
  const renderSkeletonCards = () => {
    return Array.from({ length: 10 }, (_, index) => (
      <SkeletonSignalPostCard key={`skeleton-${index}`} />
    ));
  };

  if (isLoading && page === 1) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ScrollView style={styles.skeletonContainer}
          showsVerticalScrollIndicator={false}
        >
          {renderSkeletonCards()}
        </ScrollView>
      </GestureHandlerRootView>
    );
  }

  if (signalPostsError) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>
          {signalPostsError?.message || "An error occurred while loading data"}
        </Text>

        <View style={styles.retryButtonContainer}>
          <Pressable
            style={[
              styles.retryButton,
              isFetching && { opacity: 0.7 }, // dim when loading
            ]}
            disabled={isFetching}
            onPress={() => {
              setPage(1);
              refetch();
            }}
          >
            {isFetching ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.retryText}>Retry</Text>
            )}
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {(
        <FlatList
          data={signalPostsData}
          renderItem={renderSignalPost}
          keyExtractor={(item) => item.id.toString()}
          estimatedItemSize={320} // Measure your actual card height
          contentContainerStyle={{
            paddingVertical: 10,
            paddingBottom: 0,
            backgroundColor: "#fff",
          }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmptyComponent}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          onEndReached={handleLoadMoreOptimized}
          onEndReachedThreshold={0.5} // Increased threshold
          drawDistance={300}
          removeClippedSubviews={true}
          ListFooterComponent={
            isLoadingMore ? (
              <ActivityIndicator
                size="small"
                color="#007AFF"
                style={{ marginVertical: 20 }}
              />
            ) : !hasNextPage && signalPostsData?.length > 0 ? (
              <EndOfListComponent />
            ) : null
          }
        />
      )}

      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeCommentModal}
      >
        <GestureHandlerRootView style={styles.modalContainer}>
          <PanGestureHandler
            onHandlerStateChange={onGestureEvent}
            activeOffsetY={10}
            failOffsetX={[-50, 50]}
          >
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <View style={styles.dragIndicator} />
                <Text style={styles.modalTitle}>Comments</Text>
              </View>
              <CommentSheet signalPostId={signalPostId} />
            </View>
          </PanGestureHandler>
        </GestureHandlerRootView>
      </Modal>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  scrollview: {
    flex: 1,
    backgroundColor: "#FFF",
  },
  container: {
    flexGrow: 1,
    width: "100%",
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "center",
    paddingHorizontal: 1,
    paddingVertical: 10,
    gap: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFF",
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 16,
    color: "#FF3B30",
    textAlign: "center",
    marginBottom: 20,
  },
  retryButtonContainer: {
    marginTop: 15,
    alignItems: "center",
  },
  retryButton: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    backgroundColor: "#007AFF",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    overflow: "hidden",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#666",
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    flex: 1,
    maxHeight: "90%",
  },
  modalHeader: {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  dragIndicator: {
    width: 40,
    height: 4,
    backgroundColor: "#ccc",
    borderRadius: 2,
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
  },
  skeletonContainer: {
    flex: 1,
    backgroundColor: "#fff",
    paddingVertical: 10,
  },
});
