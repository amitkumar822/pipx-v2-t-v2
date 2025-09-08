import {
  Text,
  View,
  TextInput,
  SafeAreaView,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import React, { memo, useCallback, useState } from "react";
import SearchCard from "../helper/search/SearchCard";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { RFValue } from "react-native-responsive-fontsize";
import Loading from "../Loading";
import NoResultsFound from "../NoResultsFound";

function SearchScreen({
  searchTerm,
  setSearchTerm,
  searchData,
  userType,
  refreshing = false,
  handleRefresh = async () => {},
  handleLoadMore = () => {},
  isFetchingMore = false,
  hasNextPage = false,
}) {
  const insets = useSafeAreaInsets();

  const bottomHeight = insets.bottom === 0 ? 85 : insets.bottom;

  const footerComponentList = useCallback(() => {
    if (isFetchingMore) {
      return (
        <View className="my-4 items-center justify-center">
          <ActivityIndicator size="small" color="#999" />
        </View>
      );
    }

    if (!hasNextPage && searchData?.length > 0) {
      return (
        <View className="my-4 items-center justify-center">
          <Text className="text-[#888] text-sm">
            🎉 You've reached the end!
          </Text>
        </View>
      );
    }

    return null;
  }, [isFetchingMore, hasNextPage, searchData?.length]);

  return (
    <SafeAreaView className="flex-1 px-1">
      <View className="px-1">
        {/* Search Input */}
        <View className="w-full flex-row items-center bg-[#EBF5FF] rounded-2xl mb-2 mt-2 px-4">
          <Feather
            name="search"
            size={RFValue(20)}
            color="#999"
            style={{ marginRight: 8 }}
          />
          <TextInput
            className="flex-1 text-base bg-transparent"
            placeholder="Search"
            placeholderTextColor="#999"
            value={searchTerm}
            onChangeText={setSearchTerm}
            clearButtonMode="while-editing"
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchTerm ? (
            <TouchableOpacity
              onPress={() => setSearchTerm("")}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Feather
                name="x"
                size={RFValue(18)}
                color="#999"
                style={{ marginLeft: 8 }}
              />
            </TouchableOpacity>
          ) : null}
        </View>

        <View className="w-full h-[2px] bg-[#EBF5FF] shadow-[#EBF5FF]" />

        {/* Responsive List */}
        <FlatList
          data={searchData}
          renderItem={({ item }) => (
            <SearchCard searchData={item} userType={userType} />
          )}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{
            paddingBottom: bottomHeight,
            paddingTop: 8,
          }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={() => <NoResultsFound />}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          // ✅ Pagination
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={footerComponentList()}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={5}
          removeClippedSubviews={true}
          extraData={[hasNextPage, isFetchingMore, searchData?.length]}
        />
      </View>
    </SafeAreaView>
  );
}

export default memo(SearchScreen);
