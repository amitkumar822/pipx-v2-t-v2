import React, { useCallback, useEffect, useMemo, useState } from "react";
import useDebounce from "@/src/hooks/useDebounce";
import { useUsersListSearch } from "@/src/hooks/useApi";
import SearchScreen from "../../screens/SearchScreen";
import debounce from "lodash/debounce";
import Toast from "react-native-toast-message";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import SearchCardSkeleton from "./SearchCardSkeleton";
import { GestureHandlerRootView, ScrollView } from "react-native-gesture-handler";

const AgentSearchScreen = () => {
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [perPage] = useState(20);

  const [searchTerm, setSearchTerm] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const [userData, setUserData] = useState([]);

  // Debounce the search term to avoid too many API calls
  const debouncedValue = useDebounce(searchTerm, 500);

  // Reset page and userdata when search term changes
  useEffect(() => {
    setPage(1);
    // Clear existing user data when search term changes
    setUserData([]);
  }, [debouncedValue]);

  const queryOptions = useMemo(() => ({ page, perPage }), [page, perPage]);

  // Use the custom hook to fetch the search results
  const { data, isLoading, error, refetch, isFetching } = useUsersListSearch(
    debouncedValue,
    queryOptions,
    {
      enabled: !!debouncedValue || page > 1,
    }
  );

  useEffect(() => {
    if (page === 1) {
      setUserData(data?.data || []);
    } else {
      setUserData((prev) => [...prev, ...(data?.data || [])]);
    }
  }, [data, page, refreshing]);

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      setUserData([]);
      setPage(1); // Reset to first page
      await refetch();
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Refresh Error",
        text2: error.message,
      });
    } finally {
      setRefreshing(false);
    }
  };

  const handleLoadMore = useCallback(
    debounce(() => {
      if (data?.hasNextPage && !isFetchingMore) {
        setIsFetchingMore(true);
        setPage((prev) => prev + 1);
      }
    }, 300),
    [data, isFetchingMore]
  );

  // Set fetchingMore to false when data updates
  useEffect(() => {
    setIsFetchingMore(false);
  }, [data]);

  if (isLoading && page === 1) {
    return (
      <GestureHandlerRootView style={{ flex: 1, paddingHorizontal: 10 }}>
        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          {Array.from({ length: 30 }).map((_, index) => (
            <SearchCardSkeleton key={index} />
          ))}
        </ScrollView>
      </GestureHandlerRootView>
    );
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center px-4">
        <Text className="text-red-400 text-base font-medium text-center mb-4">
          {error?.message || "An error occurred while loading data"}
        </Text>

        <View className="mt-2">
          <Pressable
            className={`bg-blue-500 px-6 py-3 rounded-lg items-center justify-center min-w-[100px] ${isFetching ? "opacity-70" : ""
              }`}
            disabled={isFetching}
            onPress={() => {
              setPage(1);
              refetch();
            }}
          >
            {isFetching ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text className="text-white text-base font-semibold">Retry</Text>
            )}
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <>
      <SearchScreen
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        searchData={userData}
        handleRefresh={handleRefresh}
        setRefreshing={setRefreshing}
        refreshing={refreshing}
        // ✅ Pagination
        handleLoadMore={handleLoadMore}
        isFetchingMore={isFetchingMore}
        hasNextPage={data?.hasNextPage}
        userType="SIGNAL_PROVIDER"
      />
    </>
  );
};

export default AgentSearchScreen;
