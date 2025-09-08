import React, { useState, useEffect, useCallback, memo } from "react";
import {
  Text,
  View,
  FlatList,
  Pressable,
  ActivityIndicator,
  Alert,
  Dimensions,
} from "react-native";
import { router } from "expo-router";
import { ProfileHeader } from "../helper/profile/ProfileHeader";
import { BottomModal } from "../helper/profile/BottomModal";
import apiService from "../../services/api";
import { useUserProvider } from "@/src/context/user/userContext";
import {
  useBlockUnblockSignalProvider,
  useUnfollowSignalProvider,
} from "@/src/hooks/useApi";
import ReportBlockModal from "../helper/ReportBlockModel";
import { RFValue } from "react-native-responsive-fontsize";
import debounce from "lodash/debounce";
import { AppImage } from "../utils/AppImage";
import NoResultsFound from "../NoResultsFound";

const { width } = Dimensions.get("window");
const ITEM_WIDTH = width * 0.95;
const NAME_WIDTH = ITEM_WIDTH * 0.55;
const blurhash =
  "|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[";

export const UserFollowingScreen = ({ boxType }) => {
  //^=============Start Pagination Functionality==============
  const [following, setFollowing] = useState([]);
  const [hasNextPage, setHasNextPage] = useState(true);

  const [blockFollowingDetails, setBlockFollowingDetails] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [perPage] = useState(20);

  const handleLoadMore = useCallback(
    debounce(() => {
      if (hasNextPage && !isFetchingMore) {
        setIsFetchingMore(true);
        const nextPage = page + 1;
        setPage(nextPage);
        fetchFollowing(nextPage);
      }
    }, 300),
    [hasNextPage, isFetchingMore, page]
  );

  useEffect(() => {
    setIsFetchingMore(false);
  }, [following]);

  //^=============End Pagination Functionality================

  const { profile } = useUserProvider();

  const [isOpened, setIsOpened] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  //& ==================Blocked Functionality========================

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      setPage(1); // Reset to first page
      setIsFetchingMore(false);
      setError(null);
      setFollowing([]);
      setBlockFollowingDetails([]);
      setIsOpened(false);
      await fetchFollowing(1);
      setRefreshing(false);
    } catch (error) {
      setRefreshing(false);
      Alert.alert("Error", "Failed to refresh blocked users");
    }
  };

  //* ==================Following Fetch Functionality========================
  useEffect(() => {
    fetchFollowing(1);
  }, []);

  // Fetch Following or Blocked Users
  const fetchFollowing = async (currentPage = 1) => {
    try {
      setLoading(true);
      setError(null);

      const response =
        boxType === "blocked"
          ? await apiService.getAgentBlocked(currentPage, perPage)
          : await apiService.getUserFollowing(currentPage, perPage);

      if (response.statusCode === 200 && response.data) {
        const newData = response.data;
        setHasNextPage(response.hasNextPage ?? false); // Check server response
        setFollowing(response);

        setBlockFollowingDetails((prev) =>
          currentPage === 1 ? newData : [...prev, ...newData]
        );
      } else {
        setFollowing([]);
      }
    } catch (error) {
      setError(error?.message || "Failed to load following list");
      setFollowing([]);
    } finally {
      setLoading(false);
      setIsFetchingMore(false);
    }
  };

  const [visible, setVisible] = useState(false);
  const [modalType, setModalType] = useState("");
  const [signalProvId, setSignalProvId] = useState("");
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");

  // Handle unfollow action
  const handleUnfollowUnBlock = async (signalProvider) => {
    if (boxType === "blocked") {
      setVisible(true);
      setModalType("unblock");
      setSignalProvId(signalProvider.id);
      setUsername(signalProvider.username);
      setFullName(
        `${signalProvider.first_name} ${" "} ${signalProvider.last_name}`
      );
      return;
    }

    setUsername(signalProvider.username);
    setVisible(true);
    setModalType("unfollow");
    setSignalProvId(signalProvider.id);
  };

  // Unblock Hook
  const blockUnblockMutation = useBlockUnblockSignalProvider();

  // Handle Unblock Signal Provider by USER
  const handleUnBlock = async () => {
    if (!signalProvId) {
      Alert.alert("Error", "Signal Provider ID is missing.");
      return;
    }

    blockUnblockMutation.mutateAsync(signalProvId, {
      onSuccess: () => {
        setSignalProvId("");
        setIsOpened(false);
        setModalType("success");

        setBlockFollowingDetails((prev) =>
          prev.filter((item) => item.signal_provider.id !== signalProvId)
        );

        setTimeout(() => {
          setVisible(false);
        }, 3000);
      },
      onError: (error) => {
        Alert.alert(
          "Error",
          error?.message || "Failed to block/unblock the signal provider."
        );
      },
    });
  };

  // Handle Unfollow Signal Provider by USER Hook
  const { mutate: unfollowSignalProvider } = useUnfollowSignalProvider();

  // Handle Unfollow Signal Provider by USER
  const handleUnfollow = async () => {
    if (!signalProvId) {
      Alert.alert("Error", "Signal Provider ID is missing.");
      return;
    }

    // Call the unfollow mutation
    unfollowSignalProvider(signalProvId, {
      onSuccess: (res) => {
        setSignalProvId("");
        setIsOpened(false);
        setModalType("success");
        setBlockFollowingDetails((prev) =>
          prev.filter((item) => item.signal_provider.id !== signalProvId)
        );
        setTimeout(() => {
          setVisible(false);
        }, 3000);
      },
      onError: (error) => {
        Alert.alert(
          "Error",
          error?.message || "Failed to unfollow the signal provider."
        );
      },
    });
  };

  const renderEmptyComponent = () => (
    <View className="flex-1 items-center justify-center py-12">
      <Text className="text-lg font-semibold text-gray-600 mb-2">
        Not {boxType === "blocked" ? "blocked" : "following"} anyone yet
      </Text>
      <Text className="text-sm text-center text-gray-400">
        Start {boxType === "blocked" ? "blocked" : "following"} signal providers
        to see them here
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View className="flex-1 items-center justify-start">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#007AFF" />
          <Text className="mt-3 text-base text-gray-500">
            Loading following...
          </Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-start bg-[#FFFFFF]">
        <ProfileHeader
          backtxt={`@${profile?.username}`}
          righttxt={""}
          righticon={null}
          backaction={() => router.back()}
        />
        <View className="flex-1 items-center justify-center px-5">
          <Text className="text-center text-base text-red-500 mb-4">
            {JSON.stringify(error, null, 2)}
          </Text>
          <Pressable
            className="bg-blue-500 px-4 py-2 rounded"
            onPress={() => {
              setFollowing([]);
              setBlockFollowingDetails([]);
              fetchFollowing(1);
            }}
          >
            <Text className="text-white text-base">Retry</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <>
      <View className="flex-1 items-center justify-start bg-[#FFFFFF]">
        <ProfileHeader
          backtxt={`@${profile?.username}`}
          righttxt={""}
          righticon={null}
          backaction={() => router.back()}
        />

        <View className="w-full flex-col items-center gap-4">
          <View className="w-full h-10 items-center justify-center bg-blue-50">
            <Text className="text-blue-500 text-base font-medium leading-[18px]">
              {following?.length}{" "}
              {boxType === "blocked" ? "Blocked" : "Following"}
            </Text>
          </View>

          <FlatList
            data={blockFollowingDetails}
            renderItem={({ item }) => (
              <FollowerItem
                item={item}
                onUnfollow={handleUnfollowUnBlock}
                setIsOpened={setIsOpened}
                isOpened={isOpened}
                boxType={boxType}
              />
            )}
            keyExtractor={(item) => item.id.toString()}
            className="w-full"
            ListEmptyComponent={renderEmptyComponent}
            refreshing={refreshing}
            onRefresh={handleRefresh}
            // pagination
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
            ListFooterComponent={
              isFetchingMore ? (
                <View className="flex items-center justify-center py-4">
                  <ActivityIndicator size="small" color="#007AFF" />
                </View>
              ) : !hasNextPage && blockFollowingDetails.length > 0 ? (
                <View className="my-4 items-center justify-center">
                  <Text className="text-[#888] text-sm">
                    🎉 You've reached the end!
                  </Text>
                </View>
              ) : null
            }
            initialNumToRender={10}
            maxToRenderPerBatch={10}
            windowSize={5}
            removeClippedSubviews={true}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </View>

      <BottomModal isOpened={isOpened} setIsOpened={setIsOpened} />

      {/* Unblock Model when user click unblock so open unblock model */}
      <ReportBlockModal
        visible={visible}
        userName={username}
        fullName={fullName}
        type={modalType}
        onClose={() => setVisible(false)}
        onAction={modalType === "unblock" ? handleUnBlock : handleUnfollow}
      />
    </>
  );
};

const FollowerItem = memo(
  ({ item, onUnfollow, isOpened, setIsOpened, boxType }) => {
    const [unfollowing, setUnfollowing] = useState(false);

    // Handle unfollow or unblock action
    const handleUnfollow = async () => {
      setUnfollowing(true);
      try {
        await onUnfollow(item.signal_provider);
      } catch (error) {
        Alert.alert(
          "Error",
          `Failed to unfollow signal provider: ${error?.message || error}`
        );
      } finally {
        setUnfollowing(false);
      }
    };

    return (
      <View
        className="mx-auto flex-row justify-between items-center gap-3 px-1 py-2 overflow-hidden"
        style={{
          width: ITEM_WIDTH,
          borderBottomWidth: 1,
          borderColor: "#E0E0E0",
        }}
      >
        <View className="flex-row items-center gap-2">
          <View className="w-12 h-12 bg-white rounded-full overflow-hidden items-center justify-center">
            <AppImage
              uri={item.signal_provider?.profile_image}
              contentFit="cover"
              placeholder={{ blurhash }}
              style={{ width: "100%", height: "100%" }}
            />
          </View>

          <View
            className="flex-row flex-wrap items-center gap-1"
            style={{ width: NAME_WIDTH }}
          >
            <Text
              className="font-semibold"
              style={{
                fontSize: RFValue(13),
              }}
            >
              {item.signal_provider?.first_name || item.first_name}{" "}
              {item.signal_provider?.last_name || item.last_name}
            </Text>
            <Text
              className="font-normal text-gray-500"
              style={{
                fontSize: RFValue(11),
              }}
            >
              (@{item.signal_provider?.username || item.username})
            </Text>
          </View>
        </View>

        {boxType === "following" ? (
          <Pressable
            className={`border border-[#007AFF] px-2 py-1 rounded ${
              unfollowing ? "opacity-50" : ""
            }`}
            onPress={handleUnfollow}
            disabled={unfollowing}
          >
            <Text
              className="text-[#007AFF]"
              style={{
                fontSize: RFValue(11),
              }}
            >
              {unfollowing ? "Unfollowing..." : "Unfollow"}
            </Text>
          </Pressable>
        ) : (
          <Pressable
            className={`border border-blue-400 px-2 py-1 rounded ${
              unfollowing ? "opacity-50" : ""
            }`}
            onPress={handleUnfollow}
            disabled={unfollowing}
          >
            <Text className="text-blue-400 text-sm">Unblock</Text>
          </Pressable>
        )}
      </View>
    );
  }
);
