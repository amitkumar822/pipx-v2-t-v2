import React, { memo } from "react";
import {
  Text,
  View,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { ProfileHeader } from "../helper/profile/ProfileHeader";
import { router } from "expo-router";
import { useUserProvider } from "@/src/context/user/userContext";
import { AppImage } from "../utils/AppImage";

const blurhash =
  "|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[";

export const AgentFollowersScreen = ({
  followersData,
  onLoadMore,
  onRefresh,
  refreshing = false,
  isFetchingMore,
  hasNextPage,
}) => {
  const { profile } = useUserProvider();

  return (
    <View style={styles.profilecontainer}>
      <ProfileHeader
        backtxt={"@" + profile?.username}
        righttxt={""}
        righticon={null}
        backaction={() => router.back()}
      />

      <View style={styles.main}>
        <View style={styles.followertitle}>
          <Text style={styles.titletxt}>{followersData?.length} Followers</Text>
        </View>

        <FlatList
          data={followersData}
          renderItem={({ item }) => <FollowerItem userInfo={item?.user} />}
          keyExtractor={(item) => item.id.toString()}
          style={{ width: "100%" }}
          contentContainerStyle={{ paddingBottom: 20 }}
          // pagination
          onEndReached={onLoadMore}
          onEndReachedThreshold={0.5}
          onRefresh={onRefresh}
          refreshing={refreshing}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={() => (
            <View style={{ padding: 20, alignItems: "center" }}>
              <Text>No followers found.</Text>
            </View>
          )}
          ListFooterComponent={() => {
            if (isFetchingMore) {
              return (
                <View style={{ padding: 20, alignItems: "center" }}>
                  <ActivityIndicator size="small" />
                  <Text style={{ marginTop: 8 }}>Loading more...</Text>
                </View>
              );
            }

            if (!hasNextPage && followersData?.length > 0) {
              return (
                <View style={{ padding: 20, alignItems: "center" }}>
                  <Text>🎉 You've reached the end!</Text>
                  <Text>No more followers to load</Text>
                </View>
              );
            }

            return null;
          }}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={5}
          removeClippedSubviews={true}
        />
      </View>
    </View>
  );
};

const FollowerItem = memo(({ userInfo }) => {
  return (
    <View style={styles.itembox}>
      <View style={styles.profileimg}>
        <AppImage
          uri={userInfo?.user?.profile_image}
          contentFit="cover"
          placeholder={{ blurhash }}
          style={{
            width: "100%",
            height: "100%",
          }}
        />
      </View>

      <View style={styles.titlebox}>
        <Text style={styles.title}>
          {userInfo?.first_name} {userInfo?.last_name}
        </Text>
        <Text>{`(@${userInfo?.username})`}</Text>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  profilecontainer: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
  },
  main: {
    width: "100%",
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "center",
    gap: 16,
  },
  followertitle: {
    width: "100%",
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#E6F2FF",
  },
  titletxt: {
    color: "#007AFF",
    fontSize: 16,
    lineHeight: 18,
    fontWeight: "500",
  },
  itembox: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    gap: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  profileimg: {
    width: 46,
    height: 46,
    backgroundColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 23,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 60,
    overflow: "hidden",
  },
  titlebox: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    gap: 6,
  },
  title: {
    fontSize: 14,
    fontWeight: "600",
  },
  user: {
    fontSize: 14,
    fontWeight: "400",
  },
});
