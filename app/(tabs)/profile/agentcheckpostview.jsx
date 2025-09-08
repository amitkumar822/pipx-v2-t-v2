import React, { useCallback, useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { BackHeader } from "@/src/components/helper/auth/BackHeader";
import { useOwnSignalPosts } from "@/src/hooks/useApi";
import { AgentHomeScreen } from "@/src/components/screens/AgentHomeScreen";
import debounce from "lodash/debounce";

const Agentcheckpostview = () => {
  // pagination state
  const [page, setPage] = useState(1);
  let perPage = 20; // Set your desired per page value here
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
  } = useOwnSignalPosts({
    page,
    perPage,
  });

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
        // Reset loading state after a delay
        setTimeout(() => setIsLoadingMore(false), 1000);
      }
    }, 300),
    [hasNextPage, isLoadingMore, isSignalPostsLoading, page]
  );

  return (
    <SafeAreaView className="h-screen">
      <BackHeader />
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
    </SafeAreaView>
  );
};

export default Agentcheckpostview;
