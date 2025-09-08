import { View, Text, Modal, ScrollView, Pressable } from "react-native";
import React from "react";

const AssetModel = ({
  assetModalVisible,
  setAssetModalVisible,
  assets,
  setSelectedAsset,
  updateFormData,
}) => {
  return (
    <Modal visible={assetModalVisible} transparent animationType="slide">
      <View
        style={{
          flex: 1,
          justifyContent: "flex-end",
          backgroundColor: "rgba(0,0,0,0.4)",
        }}
      >
        <View
          style={{
            backgroundColor: "white",
            padding: 20,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            maxHeight: "60%",
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10 }}>
            Select Asset
          </Text>
          <ScrollView>
            {assets.map((asset) => (
              <Pressable
                key={asset.id}
                onPress={() => {
                  setSelectedAsset(asset);
                  updateFormData("asset", asset.id);
                  setAssetModalVisible(false);
                }}
                style={{
                  paddingVertical: 12,
                  borderBottomWidth: 1,
                  borderColor: "#eee",
                }}
              >
                <Text style={{ fontSize: 16 }}>{asset.name}</Text>
              </Pressable>
            ))}
          </ScrollView>
          <Pressable
            onPress={() => setAssetModalVisible(false)}
            style={{ marginTop: 15, alignItems: "center" }}
          >
            <Text style={{ color: "red", fontWeight: "600" }}>Cancel</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

export default AssetModel;
