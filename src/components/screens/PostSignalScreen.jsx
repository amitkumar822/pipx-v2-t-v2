import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  TextInput,
  Switch,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import React, { useState, useEffect } from "react";
import PostSignalHeader from "../helper/postsignals/PostSignalHeader";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import Feather from "@expo/vector-icons/Feather";
import Ionicons from "@expo/vector-icons/Ionicons";
import apiService from "../../services/api";
import { validateRequired } from "../../utils/validation";
import { useErrorHandler } from "../../hooks/useErrorHandler";
import { router } from "expo-router";
import AssetModel from "../helper/postsignals/AssetModel";
import { useCreateSignalPost } from "@/src/hooks/useApi";
import Toast from "react-native-toast-message";

export default function PostSignalScreen() {
  const [signalType, setSignalType] = useState("Scalping");
  const [signalDate, setSignalDate] = useState(new Date());
  const [dateOpen, setDateOpen] = useState(false);
  const [isBuy, setIsBuy] = useState(true);
  const [isEnabled, setIsEnabled] = useState(false);

  // Form fields
  const [formData, setFormData] = useState({
    asset: "",
    tp1: "",
    tp2: "",
    tp3: "",
    stop_loss: "",
    caption: "",
    description: "",
  });

  const [assets, setAssets] = useState([]);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [assetsLoading, setAssetsLoading] = useState(true);

  // This state is used to control the visibility of the asset selection modal
  const [assetModalVisible, setAssetModalVisible] = useState(false);

  const { handleApiError } = useErrorHandler();

  useEffect(() => {
    fetchAssets();
  }, []);

  // Fetch assets from the API
  const fetchAssets = async () => {
    try {
      setAssetsLoading(true);
      // get all assets when i am using perPage -1
      const page = 1;
      const perPage = -1;

      const response = await apiService.getAssets(page, perPage);

      if (response.statusCode === 200 && response.data) {
        setAssets(response.data);
        if (response.data.length > 0) {
          setSelectedAsset(response.data[0]);
          setFormData((prev) => ({ ...prev, asset: response.data[0].id }));
        }
      }
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2:
          error?.message || "Failed to load assets. Please try again later.",
      });
      handleApiError(error, "Failed to load assets");
    } finally {
      setAssetsLoading(false);
    }
  };

  // Validate form fields
  const validateForm = () => {
    const newErrors = {};

    if (!selectedAsset) {
      newErrors.asset = "Please select an asset";
    }

    if (formData.tp1) {
      if (isNaN(parseFloat(formData.tp1))) {
        newErrors.tp1 = "TP1 must be a valid number";
      }
    }

    if (formData.tp2) {
      if (isNaN(parseFloat(formData.tp2))) {
        newErrors.tp2 = "TP2 must be a valid number";
      }
    }

    if (formData.tp3) {
      if (isNaN(parseFloat(formData.tp3))) {
        newErrors.tp3 = "TP3 must be a valid number";
      }
    }

    if (formData.stop_loss) {
      if (isNaN(parseFloat(formData.stop_loss))) {
        newErrors.stop_loss = "Stop loss must be a valid number";
      }
    }

    const captionValidation = validateRequired(formData.caption, "Caption");
    if (!captionValidation.isValid) {
      newErrors.caption = captionValidation.message;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Post Hook
  const { mutate: createSignalPost } = useCreateSignalPost();

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert("Validation Error", "Please fix the errors and try again");
      return;
    }
    setLoading(true);
    const signalData = {
      signal_type: signalType,
      asset: selectedAsset.id,
      tp1: formData.tp1 ? parseFloat(formData.tp1) : null,
      tp2: formData.tp2 ? parseFloat(formData.tp2) : null,
      tp3: formData.tp3 ? parseFloat(formData.tp3) : null,
      stop_loss: formData.stop_loss ? parseFloat(formData.stop_loss) : null,
      caption: formData.caption.trim(),
      description: formData.description.trim(),
      is_premium: isEnabled,
      direction: isBuy ? "BUY" : "SELL",
    };

    createSignalPost(signalData, {
      onSuccess: () => {
        setLoading(false);
        Alert.alert("Success", "Signal posted successfully!", [
          {
            text: "OK",
            onPress: () => {
              // Reset form
              setFormData({
                asset: assets.length > 0 ? assets[0].id : "",
                tp1: "",
                tp2: "",
                tp3: "",
                stop_loss: "",
                caption: "",
                description: "",
              });
              setErrors({});
              setSelectedAsset(assets.length > 0 ? assets[0] : null);
              setIsBuy(true);
              setIsEnabled(false);
              setSignalType("Scalping");
              setSignalDate(new Date());
              setAssetModalVisible(false); // Close modal after successful post
              router.back(); // Navigate back after posting
            },
          },
        ]);
      },
      onError: (error) => {
        setLoading(false);
        // Extract a useful error message or fallback
        const errorMessage =
          error?.response?.data?.message || // for Axios-based APIs
          error?.message || // general JS error
          "Please try again later."; // fallback default
        // Show alert with title and error message
        Alert.alert("Failed to Post", errorMessage);
        handleApiError(error, "Failed to create signal");
      },
    });
  };

  // Update form data and clear error for that field
  const updateFormData = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      <PostSignalHeader />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{
              flexGrow: 1,
              paddingBottom: Platform.OS === "ios" ? 100 : 50,
            }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            automaticallyAdjustKeyboardInsets={Platform.OS === "ios"}
          >
            <View style={styles.postsignalcontainer}>
              <View style={styles.userselection}>
                <Pressable
                  style={
                    signalType === "Scalping"
                      ? styles.selected
                      : styles.unselected
                  }
                  onPress={() => setSignalType("Scalping")}
                >
                  <Text
                    style={
                      signalType === "Scalping"
                        ? styles.selectedusertext
                        : styles.unselectedusertext
                    }
                  >
                    Scalping
                  </Text>
                </Pressable>

                <Pressable
                  style={
                    signalType === "Swing" ? styles.selected : styles.unselected
                  }
                  onPress={() => setSignalType("Swing")}
                >
                  <Text
                    style={
                      signalType === "Swing"
                        ? styles.selectedusertext
                        : styles.unselectedusertext
                    }
                  >
                    Swing
                  </Text>
                </Pressable>
                <Pressable
                  style={
                    signalType === "Long Term"
                      ? styles.selected
                      : styles.unselected
                  }
                  onPress={() => setSignalType("Long Term")}
                >
                  <Text
                    style={
                      signalType === "Long Term"
                        ? styles.selectedusertext
                        : styles.unselectedusertext
                    }
                  >
                    Long Term
                  </Text>
                </Pressable>
              </View>

              <View style={styles.newpostsignalcontainer}>
                <View style={styles.assetbox}>
                  <Text style={{ fontSize: 18, fontWeight: "600" }}>Asset</Text>
                  {assetsLoading ? (
                    <View
                      style={[
                        styles.inputfieldenabled,
                        { justifyContent: "center", alignItems: "center" },
                      ]}
                    >
                      <ActivityIndicator size="small" color="#007AFF" />
                    </View>
                  ) : (
                    <Pressable
                      style={[
                        styles.inputfieldenabled,
                        errors.asset && styles.inputError,
                      ]}
                      onPress={() => {
                        if (assets.length > 0) {
                          setAssetModalVisible(true); // Show modal instead of Alert
                        }
                      }}
                    >
                      <Text style={{ color: selectedAsset ? "#000" : "#999" }}>
                        {selectedAsset ? selectedAsset.name : "Select Asset"}
                      </Text>
                    </Pressable>
                  )}
                  {errors.asset && (
                    <Text style={styles.errorText}>{errors.asset}</Text>
                  )}
                </View>

                {/* Date and Time picker */}
                <View style={styles.coltwobox}>
                  <View style={styles.halfassetbox}>
                    <Text style={{ fontSize: 18, fontWeight: "600" }}>
                      Date
                    </Text>
                    <Pressable
                      style={styles.datetimefield}
                      onPress={() => {
                        setDateOpen(true);
                      }}
                    >
                      <Text style={{ color: "#000000" }}>
                        {signalDate.toLocaleDateString()}
                      </Text>
                      <Feather name="calendar" size={18} color="black" />
                    </Pressable>
                  </View>

                  {/* Direction */}
                  <>
                    <View style={styles.halfassetbox}>
                      <Text style={{ fontSize: 18, fontWeight: "600" }}>
                        Direction
                      </Text>
                      <Pressable
                        style={styles.buysellcontainer}
                        onPress={() => {
                          setIsBuy(!isBuy);
                        }}
                      >
                        <View
                          style={
                            isBuy ? styles.buyselected : styles.buyunselected
                          }
                        >
                          <Text
                            style={
                              isBuy
                                ? styles.buyselectedtxt
                                : styles.buyunselectedtxt
                            }
                          >
                            Buy
                          </Text>
                        </View>
                        <View
                          style={
                            isBuy ? styles.buyunselected : styles.buyselected
                          }
                        >
                          <Text
                            style={
                              isBuy
                                ? styles.buyunselectedtxt
                                : styles.buyselectedtxt
                            }
                          >
                            Sell
                          </Text>
                        </View>
                      </Pressable>
                    </View>
                  </>
                </View>


                <View style={styles.coltwobox}>
                  <View style={styles.halfassetbox}>
                    <Text style={{ fontSize: 18, fontWeight: "600" }}>
                      Take Profit 1
                    </Text>
                    <TextInput
                      style={[
                        styles.datetimefield,
                        errors.tp1 && styles.inputError,
                      ]}
                      placeholder="Optional"
                      keyboardType="numeric"
                      value={formData.tp1}
                      onChangeText={(value) => updateFormData("tp1", value)}
                    />
                    {errors.tp1 && (
                      <Text style={styles.errorTextSmall}>{errors.tp1}</Text>
                    )}
                  </View>
                  <View style={styles.halfassetbox}>
                    <Text style={{ fontSize: 18, fontWeight: "600" }}>
                      Take Profit 2
                    </Text>
                    <TextInput
                      style={[
                        styles.datetimefield,
                        errors.tp2 && styles.inputError,
                      ]}
                      placeholder="Optional"
                      keyboardType="numeric"
                      value={formData.tp2}
                      onChangeText={(value) => updateFormData("tp2", value)}
                    />
                    {errors.tp2 && (
                      <Text style={styles.errorTextSmall}>{errors.tp2}</Text>
                    )}
                  </View>
                </View>

                <View style={styles.coltwobox}>
                  <View style={styles.halfassetbox}>
                    <Text style={{ fontSize: 18, fontWeight: "600" }}>
                      Take Profit 3
                    </Text>
                    <TextInput
                      style={[
                        styles.datetimefield,
                        errors.tp3 && styles.inputError,
                      ]}
                      placeholder="Optional"
                      keyboardType="numeric"
                      value={formData.tp3}
                      onChangeText={(value) => updateFormData("tp3", value)}
                    />
                    {errors.tp3 && (
                      <Text style={styles.errorTextSmall}>{errors.tp3}</Text>
                    )}
                  </View>
                  <View style={styles.halfassetbox}>
                    <Text style={{ fontSize: 18, fontWeight: "600" }}>
                      Caption
                    </Text>
                    <TextInput
                      style={[
                        styles.datetimefield,
                        errors.caption && styles.inputError,
                      ]}
                      placeholder="Signal caption"
                      value={formData.caption}
                      onChangeText={(value) => updateFormData("caption", value)}
                    />
                    {errors.caption && (
                      <Text style={styles.errorTextSmall}>
                        {errors.caption}
                      </Text>
                    )}
                  </View>
                </View>

                <View style={styles.coltwobox}>
                  <View style={styles.halfassetbox}>
                    <Text style={{ fontSize: 18, fontWeight: "600" }}>
                      Stop Loss
                    </Text>
                    <TextInput
                      style={[
                        styles.datetimefield,
                        errors.stop_loss && styles.inputError,
                      ]}
                      placeholder="Optional"
                      keyboardType="numeric"
                      value={formData.stop_loss}
                      onChangeText={(value) =>
                        updateFormData("stop_loss", value)
                      }
                    />
                    {errors.stop_loss && (
                      <Text style={styles.errorTextSmall}>
                        {errors.stop_loss}
                      </Text>
                    )}
                  </View>
                  <View style={{ ...styles.halfassetbox, gap: 0 }}>
                    <Text style={{ fontSize: 18, fontWeight: "600" }}>
                      Content Visibility
                    </Text>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 8,
                        height: 36,
                      }}
                    >
                      <Switch
                        trackColor={{ false: "#767577", true: "#007AFF" }}
                        thumbColor={isEnabled ? "#FFFFFF" : "#f4f3f4"}
                        ios_backgroundColor="#3e3e3e"
                        onValueChange={setIsEnabled}
                        value={isEnabled}
                      />
                      <Text style={{ fontSize: 16, color: "#50555C" }}>
                        Subscriber only
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.assetbox}>
                  <TextInput
                    style={[
                      styles.inputfieldenabled,
                      { height: 80, textAlignVertical: "top" },
                    ]}
                    placeholder="Description (optional)"
                    multiline
                    numberOfLines={3}
                    value={formData.description}
                    onChangeText={(value) =>
                      updateFormData("description", value)
                    }
                  />
                </View>

                <View style={styles.assetbox}>
                  <Pressable
                    style={[
                      styles.postsignalsubmit,
                      loading && styles.postsignalsubmitDisabled,
                    ]}
                    onPress={handleSubmit}
                    disabled={loading}
                  >
                    {loading ? (
                      <ActivityIndicator size="small" color="#FFF" />
                    ) : (
                      <Text style={styles.postsignalsubmittxt}>
                        Post Signal
                      </Text>
                    )}
                  </Pressable>
                </View>
              </View>
            </View>

            <DateTimePickerModal
              isVisible={dateOpen}
              mode="date"
              date={signalDate}
              onConfirm={(date) => {
                setDateOpen(false);
                setSignalDate(date);
              }}
              onCancel={() => {
                setDateOpen(false);
              }}
            />
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

      <AssetModel
        assetModalVisible={assetModalVisible}
        setAssetModalVisible={setAssetModalVisible}
        assets={assets}
        setSelectedAsset={setSelectedAsset}
        updateFormData={updateFormData}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  newpostsignalcontainer: {
    flex: 1,
    width: "100%",
    justifyContent: "flex-start",
    alignItems: "center",
    gap: 12,
  },
  postsignalcontainer: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 18,
  },
  userselection: {
    width: "100%",
    borderColor: "#007AFF",
    borderWidth: 2,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: 28,
    overflow: "hidden",
    padding: 2,
    marginBottom: 12,
  },
  selected: {
    width: "33%",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 12,
    backgroundColor: "#007AFF",
    borderRadius: 22,
  },
  unselected: {
    width: "33%",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 12,
    backgroundColor: "#FFF",
  },
  selectedusertext: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  unselectedusertext: {
    color: "#A8A8A8",
    fontSize: 16,
    fontWeight: "600",
  },
  assetbox: {
    width: "99%",
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "flex-start",
    gap: 6,
  },
  inputfieldenabled: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    height: 36,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 8,
    fontSize: 16,
    fontWeight: "500",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#C2C2C2",
    color: "#000000",
  },
  coltwobox: {
    width: "99%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  halfassetbox: {
    width: "48%",
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "flex-start",
    gap: 6,
  },
  datetimefield: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    height: 36,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 8,
    fontSize: 16,
    fontWeight: "500",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#C2C2C2",
    color: "#000000",
  },
  buysellcontainer: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderColor: "#007AFF",
    borderWidth: 1,
    borderRadius: 18,
    overflow: "hidden",
  },
  buyselected: {
    width: "50%",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 8,
    backgroundColor: "#007AFF",
    borderRadius: 18,
  },
  buyunselected: {
    width: "50%",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 8,
  },
  buyselectedtxt: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  buyunselectedtxt: {
    color: "#A8A8A8",
    fontSize: 16,
    fontWeight: "600",
  },
  postsignalsubmit: {
    width: "100%",
    backgroundColor: "#007AFF",
    height: 48,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
    marginTop: 12,
  },
  postsignalsubmittxt: {
    color: "#FFFFFF",
    fontSize: 18,
  },
  postsignalsubmitDisabled: {
    opacity: 0.6,
  },
  inputError: {
    borderColor: "#FF3B30",
    borderWidth: 1,
  },
  errorText: {
    color: "#FF3B30",
    fontSize: 14,
    marginTop: 4,
  },
  errorTextSmall: {
    color: "#FF3B30",
    fontSize: 12,
    marginTop: 2,
  },
});
