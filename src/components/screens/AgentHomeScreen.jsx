import {
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  FlatList,
  Pressable,
} from "react-native";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { SignalCard } from "../helper/home/SignalCard";
import apiService from "../../services/api";
import { useUserProvider } from "@/src/context/user/userContext";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { BottomSheetWrapper } from "../helper/shared/BottomSheetWrapper";
import CommentSheet from "../helper/home/CommentSheet";
import Toast from "react-native-toast-message";
import { FlashList } from "@shopify/flash-list";
import { EndOfListComponent } from "../EndOfListComponent";
import Loading from "../Loading";

export const AgentHomeScreen = ({
  signalPostsData,
  signalPostsError,
  isLoading = false,
  isFetching = false,
  refetch,
  setPage,
  isLoadingMore,
  hasNextPage,
  handleLoadMore,
}) => {
  // =========== Comment Model Open Functionalit ===================
  const [bottomSheetModalRef, setBottomSheetModalRef] = useState(null);
  const [activateSheet, setActivateSheet] = useState(false);
  const [signalPostId, setSignalPostId] = useState("");

  useEffect(() => {
    if (
      activateSheet &&
      Boolean(bottomSheetModalRef) &&
      Boolean(bottomSheetModalRef.current)
    ) {
      bottomSheetModalRef?.current?.expand();
    }
  }, [activateSheet, bottomSheetModalRef]);

  // =========== End Comment Model Open Functionalit ===================

  //^ ===== Reset currency data on Agent screen mount =====
  const { setCurrencyAssetDetails } = useUserProvider();

  useEffect(() => {
    // Clear asset-based signal data when this screen mounts
    setCurrencyAssetDetails([]);
  }, []); // Empty dependency array - runs only on mount
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
          setActivateSheet={setActivateSheet}
          setSignalPostId={setSignalPostId}
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

  if (isLoading) {
    return <Loading />;
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
      {!!signalPostsData && (
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

      <BottomSheetWrapper
        setBottomSheetModalRef={setBottomSheetModalRef}
        activateSheet={activateSheet}
        setActivateSheet={setActivateSheet}
        snapPoints={90} // Set to 90% of screen height
      >
        <View
          style={{
            width: "100%",
            height: "100%",
          }}
        >
          {!!bottomSheetModalRef && (
            <CommentSheet signalPostId={signalPostId} />
          )}
        </View>
      </BottomSheetWrapper>
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
});
