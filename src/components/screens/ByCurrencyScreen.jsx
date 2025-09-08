import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  Pressable,
} from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import apiService from "@/src/services/api";
import useErrorHandler from "@/src/hooks/useErrorHandler";
import CurrencyCard from "../helper/home/CurrencyCard";
import debounce from "lodash/debounce";
import Toast from "react-native-toast-message";

const ByCurrencyScreen = ({ setShowTab }) => {
  //^=============Start Pagination Functionality==============
  const [error, setError] = useState(null);
  const [assets, setAssets] = useState([]);
  const [assetsLoading, setAssetsLoading] = useState(true);

  const [currencyDetails, setCurrencyDetails] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [perPage] = useState(20);

  const handleLoadMore = useCallback(
    debounce(() => {
      if (assets?.hasNextPage && !isFetchingMore) {
        setIsFetchingMore(true);
        setPage((prev) => prev + 1);
        fetchAssets();
      }
    }, 300),
    [assets, isFetchingMore]
  );

  // Set fetchingMore to false when assets updates
  useEffect(() => {
    setIsFetchingMore(false);
  }, [assets]);

  // Refresh assets when the user pulls to refresh
  const handleRefresh = useCallback(async () => {
    try {
      setRefreshing(true);
      setPage(1);
      setCurrencyDetails([]);
      await fetchAssets(); // already safe
    } catch (err) {
      Toast.show({
        type: "error",
        text1: "Error refreshing assets",
        text2: err.message || "Failed to load assets. Please try again later.",
      });
    } finally {
      setRefreshing(false); // always runs, even on error
    }
  }, []);

  //^=============End Pagination Functionality================

  const { handleApiError } = useErrorHandler();

  useEffect(() => {
    fetchAssets();
  }, []);

  // Fetch assets from the API
  const fetchAssets = async () => {
    try {
      setAssetsLoading(true);
      const response = await apiService.getAssets(page, perPage);

      if (response.statusCode === 200 && response.data) {
        setAssets(response);
        setCurrencyDetails((prev) => [...prev, ...response.data]);
      }
    } catch (error) {
      handleApiError(error, "Failed to load assets");
      setError(error);
      setAssets([]);
    } finally {
      setAssetsLoading(false);
    }
  };

  if (assetsLoading) {
    return (
      <View className="w-full flex justify-center items-center">
        <Text>Loading....</Text>
      </View>
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
            className={`bg-blue-500 px-6 py-3 rounded-lg items-center justify-center min-w-[100px] ${
              assetsLoading ? "opacity-70" : ""
            }`}
            disabled={assetsLoading}
            onPress={() => {
              setAssets([]);
              setCurrencyDetails([]);
              setPage(1);
              fetchAssets();
            }}
          >
            {assetsLoading ? (
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
    <View className="w-full mx-auto flex items-center">
      <FlatList
        data={currencyDetails}
        renderItem={({ item }) => (
          <CurrencyCard item={item} setShowTab={setShowTab} />
        )}
        keyExtractor={(item) => item.id.toString()}
        numColumns={4} // Adjust as needed for screen size
        columnWrapperStyle={{
          justifyContent: "flex-start",
          paddingHorizontal: 4,
        }}
        contentContainerStyle={{
          paddingVertical: 8,
        }}
        showsVerticalScrollIndicator={false}
        // pagination
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        ListFooterComponent={
          isFetchingMore ? (
            <View className="flex items-center justify-center py-4">
              <ActivityIndicator size="small" color="#007AFF" />
            </View>
          ) : (
            <View className="my-4 items-center justify-center">
              <Text className="text-[#888] text-sm">
                🎉 You've reached the end!
              </Text>
            </View>
          )
        }
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={5}
        removeClippedSubviews={true}
      />
    </View>
  );
};

export default ByCurrencyScreen;
