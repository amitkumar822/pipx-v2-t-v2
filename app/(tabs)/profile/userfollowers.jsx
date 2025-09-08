import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { AgentFollowersScreen } from "../../../src/components/screens/AgentFollowersScreen";
import Toast from "react-native-toast-message";
import apiService from "@/src/services/api";
import { AppStatusBar } from "@/src/components/utils/AppStatusBar";

export default function UserFollowers() {
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [perPage] = useState(30);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [follows, setFollows] = useState([]);

  const fetchFollowers = async (currentPage = 1) => {
    try {
      const response = await apiService.getSignalProviderFollowers({
        page: currentPage,
        perPage,
      });

      if (response?.statusCode === 200 && response?.data) {
        setHasNextPage(response?.hasNextPage);
        return response.data;
      }
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error.message,
      });
    }
  };

  useEffect(() => {
    const init = async () => {
      const initialFollowers = await fetchFollowers(1);
      if (initialFollowers) setFollows(initialFollowers);
    };
    init();
  }, []);

  const handleLoadMore = async () => {
    if (!hasNextPage || refreshing || isFetchingMore) return;

    setIsFetchingMore(true);
    const nextPage = page + 1;
    const newFollowers = await fetchFollowers(nextPage);
    if (newFollowers?.length) {
      setFollows((prev) => [...prev, ...newFollowers]);
      setPage(nextPage);
    }
    setIsFetchingMore(false);
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      const refreshedFollowers = await fetchFollowers(1);
      if (refreshedFollowers) {
        setFollows(refreshedFollowers);
        setPage(1);
      }
    } catch (error) {
      setRefreshing(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <AppStatusBar backgroundColor="#FFF" barStyle="dark-content" />
      <AgentFollowersScreen
        followersData={follows}
        onLoadMore={handleLoadMore}
        onRefresh={handleRefresh}
        refreshing={refreshing}
        isFetchingMore={isFetchingMore}
        hasNextPage={hasNextPage}
      />
    </SafeAreaView>
  );
}
