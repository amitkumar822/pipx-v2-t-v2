import { useUserProvider } from "@/src/context/user/userContext";
import apiService from "@/src/services/api";
import React, { useEffect } from "react";
import {
  View,
  Text,
  Dimensions,
  Pressable,
  Alert,
} from "react-native";
import { RFValue } from "react-native-responsive-fontsize";
import { AppImage } from "../../utils/AppImage";

const { width: screenWidth } = Dimensions.get("window");

const CurrencyCard = ({ item, setShowTab }) => {
  const { setCurrencyAssetDetails } = useUserProvider();

  // Get Signal Provider by asset ID
  const handleFetchSignalProviderByAssetId = async (assetId) => {
    try {
      const response = await apiService.getAssetBasedSignalPosts({
        asset_id: assetId,
      });

      if (response.statusCode === 200 && response.data) {
        // Navigate to AgentScreen with the fetched data
        setShowTab("Agent");
        setCurrencyAssetDetails(response.data);
      } else {
        Alert.alert("Error", "No signal providers found for this asset.");
      }
    } catch (error) {
      console.error("Error fetching signal provider:", JSON.stringify(error));
      Alert.alert("Error", "Failed to fetch signal providers for this asset.");
      // Optionally, you can handle the error more gracefully here
      setCurrencyAssetDetails([]);
      return null;
    }
  };

  useEffect(() => {
    // Clear currency asset details when component mounts
    setCurrencyAssetDetails([]);
  }, []);

  return (
    <Pressable onPress={() => handleFetchSignalProviderByAssetId(item.id)}>
      <View
        className="bg-[#FFFFFF] rounded-2xl items-center justify-center m-1"
        style={{
          width: screenWidth * 0.21,
          height: screenWidth * 0.23,
          backgroundColor: "#FFFFFF",
          shadowColor: "#666666",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 6,
          elevation: 2,
          borderRadius: 16,
        }}
      >
        <AppImage
          uri={item?.image}
          contentFit="cover"
          style={{
            width: screenWidth * 0.11,
            height: screenWidth * 0.11,
            marginBottom: 1,
          }}
        />
        <Text
          className="font-semibold text-gray-800 mt-1"
          style={{
            fontSize: RFValue(12),
          }}
        >
          {item?.name}
        </Text>
      </View>
    </Pressable>
  );
};

export default CurrencyCard;
