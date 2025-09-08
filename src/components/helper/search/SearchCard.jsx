import { View, Text, TouchableOpacity } from "react-native";
import React, { memo, useCallback, useMemo } from "react";
import { RFValue } from "react-native-responsive-fontsize";
import { useRouter } from "expo-router";
import { AppImage } from "../../utils/AppImage";

const blurhash =
  "|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[";

const SearchCard = memo(
  ({ searchData, nameDisplay = false, userType }) => {
    const router = useRouter();

    // Memoize all derived values
    const [veryUserType, profileData] = useMemo(() => {
      const isProvider = userType === "User";
      const data = searchData?.signal_provider ?? searchData;
      return [isProvider, data];
    }, [userType, searchData]);

    const [count, netPips, signals] = useMemo(
      () => [
        veryUserType
          ? (profileData?.followers_count ?? 0)
          : (profileData?.following_count ?? 0),
        profileData?.net_pipx ?? 0,
        profileData?.signals ?? 0,
      ],
      [veryUserType, profileData]
    );

    const username = useMemo(
      () => `@${profileData?.username ?? "unknown"}`,
      [profileData?.username]
    );

    const fullName = useMemo(
      () =>
        `${profileData?.first_name ?? ""} ${profileData?.last_name ?? ""}`.trim(),
      [profileData?.first_name, profileData?.last_name]
    );

    // Optimized navigation
    const handlePress = useCallback(() => {
      if (!profileData?.id) return;
      router.push({
        pathname: "/visitprofile",
        params: {
          id: String(profileData.id),
          userType: profileData.user_type || userType,
          backRoutePath: "/(tabs)/search",
        },
      });
    }, [router, profileData, userType]);

    // Early return if no valid data
    if (!profileData) return null;

    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={handlePress}
        accessibilityRole="button"
      >
        <View className="flex-row justify-between items-center mb-2 py-2 px-3 bg-[#EBF5FF] rounded-2xl mx-auto w-full">
          {/* Left: Profile and Details */}
          <View className="flex-row items-center gap-2 flex-1">
            {/* Profile Image with caching */}
            <View className="w-[40px] h-[40px] rounded-full overflow-hidden justify-center items-center bg-gray-200">
              <AppImage
                uri={profileData.profile_image}
                contentFit="cover"
                transition={300}
                style={{ width: "100%", height: "100%" }}
              />
            </View>

            {/* Name & Stats */}
            <View className="flex-1 flex-col justify-start items-start space-y-1">
              <Text
                className="text-black leading-[24px] font-[Poppins] font-medium"
                style={{ fontSize: RFValue(14) }}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {nameDisplay ? username : fullName}
              </Text>

              <View className="flex-row flex-wrap gap-x-3">
                <StatItem
                  label={veryUserType ? "Followers" : "Following"}
                  value={count}
                />
                <StatItem label="Net Pips" value={netPips} />
                <StatItem label="Signals" value={signals} />
              </View>
            </View>
          </View>

          {/* Success Rate (Right Side) */}
          <SuccessRateIndicator rate={profileData.success_rate} />
        </View>
      </TouchableOpacity>
    );
  },
  (prevProps, nextProps) => {
    // Deep comparison for specific fields only
    return (
      prevProps.searchData?.id === nextProps.searchData?.id &&
      prevProps.nameDisplay === nextProps.nameDisplay &&
      prevProps.userType === nextProps.userType &&
      prevProps.searchData?.followers_count ===
      nextProps.searchData?.followers_count &&
      prevProps.searchData?.following_count ===
      nextProps.searchData?.following_count &&
      prevProps.searchData?.net_pipx === nextProps.searchData?.net_pipx &&
      prevProps.searchData?.signals === nextProps.searchData?.signals &&
      prevProps.searchData?.success_rate === nextProps.searchData?.success_rate
    );
  }
);

// Extracted components for better readability and performance
const StatItem = memo(({ label, value }) => (
  <View className="flex-row items-end gap-1">
    <Text className="text-xs font-[Poppins]">{label}:</Text>
    <Text className="text-sm font-[Poppins] font-medium">{value}</Text>
  </View>
));

const SuccessRateIndicator = memo(({ rate = 0 }) => (
  <View className="items-center ml-2 min-w-[60px]">
    <Text
      className="text-[#34A853] font-[Poppins] font-bold"
      style={{ fontSize: RFValue(13) }}
    >
      {rate}%
    </Text>
    <Text
      className="text-[#34A853] font-[Poppins] font-semibold"
      style={{ fontSize: RFValue(12) }}
    >
      Success
    </Text>
  </View>
));

export default SearchCard;
