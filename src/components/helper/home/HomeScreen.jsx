import { Text, View } from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import HomeHeader from "./HomeHeader";
import { AgentHomeScreen } from "../../screens/AgentHomeScreen";
import RecentlyViewedScreen from "../../screens/RecentlyViewedScreen";
import ByCurrencyScreen from "../../screens/ByCurrencyScreen";
import AgentScreen from "../../screens/AgentScreen";
import { useAllSignalPosts } from "@/src/hooks/useApi";
import debounce from "lodash/debounce";
import { SafeAreaView } from "react-native-safe-area-context";

const HomeScreen = () => {
  const [showTab, setShowTab] = useState("Agent Signals");

  // pagination state
  const [page, setPage] = useState(1);
  let perPage = 10; // Set your desired per page value here
  const [hasNextPage, setHasNextPage] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [posts, setPosts] = useState([]);

  // This hook fetches the signal posts of the agent in home screen
  const {
    data: signalPostsData,
    isLoading: isSignalPostsLoading,
    error: signalPostsError,
    refetch,
    isFetching: isFetchingSignalPosts,
  } = useAllSignalPosts(
    {
      page,
      perPage,
    },
    {
      enabled: showTab === "Agent Signals",
    }
  );

  useEffect(() => {
    if (signalPostsData?.data) {
      if (page === 1) {
        setPosts(signalPostsData.data); // fresh
      } else {
        setPosts((prev) => [...prev, ...signalPostsData.data]);
      }
      // Update hasNextPage based on API response
      setHasNextPage(!!signalPostsData?.hasNextPage);
    }
  }, [signalPostsData?.data, page]);

  const handleLoadMore = useCallback(
    debounce(() => {
      // Check if we have more pages and not currently loading
      if (hasNextPage && !isLoadingMore && !isSignalPostsLoading) {
        setIsLoadingMore(true);
        setPage((prev) => prev + 1);
      }
      console.log('====================================');
      console.log("handleLoadMore");
      console.log('====================================');
    }, 300),
    [hasNextPage, isLoadingMore, isSignalPostsLoading, page]
  );

  useEffect(() => {
    if (page > 1 && signalPostsData?.data?.length) {
      setIsLoadingMore(false);
    }
  }, [signalPostsData, page]);

  return (
    <SafeAreaView className="h-screen">
      <HomeHeader showTab={showTab} setShowTab={setShowTab} />
      <>
        {showTab === "Agent Signals" && (
          <AgentHomeScreen
            signalPostsData={posts}
            signalPostsError={signalPostsError}
            isLoading={isSignalPostsLoading}
            isFetching={isFetchingSignalPosts}
            refetch={refetch}
            page={page}
            setPage={setPage}
            isLoadingMore={isLoadingMore}
            hasNextPage={hasNextPage}
            handleLoadMore={handleLoadMore}
          />
        )}
        {showTab === "Recently viewed" && <RecentlyViewedScreen />}
        {showTab === "Lorem" && <Text>Lorem Content</Text>}
        {showTab === "By currency" && (
          <ByCurrencyScreen showTab={showTab} setShowTab={setShowTab} />
        )}
        {showTab === "Agent" && <AgentScreen />}
      </>
    </SafeAreaView>
  );
};

export default HomeScreen;
