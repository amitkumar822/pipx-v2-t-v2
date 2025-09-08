import React, { useEffect, useState, useCallback } from "react";
import {
  Text,
  View,
  StyleSheet,
  TextInput,
  ScrollView,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Modal,
} from "react-native";
import { ProfileHeader } from "../helper/profile/ProfileHeader";
import { Image } from "expo-image";
import { router } from "expo-router";
import { MaterialIcons, AntDesign } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useUserProvider } from "@/src/context/user/userContext";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import CountryPicker from "react-native-country-picker-modal";
import {
  useUpdateUserProfile,
  useUpdateSignalProviderProfile,
} from "@/src/hooks/useApi";
import Toast from "react-native-toast-message";
import { AppImage } from "../utils/AppImage";
const blurhash =
  "|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[";

export const EditProfileScreen = () => {
  const { profile } = useUserProvider();

  const userType = profile?.user_type;

  const insets = useSafeAreaInsets();

  const [userData, setUserData] = useState({
    first_name: "",
    last_name: "",
    username: "",
    email: "",
    gender: "",
    date_of_birth: "",
    bio: "",
    address: "",
    address1: "",
    old_password: "",
    new_password: "",
    confirm_password: "",
    profile_image: null,
    mobile: "",
    country_code: "",
    country_flag: "",
  });

  // Country code state
  const [countryDetails, setCountryDetails] = useState({
    cca2: "GB",
    callingCode: ["44"],
  });

  // Image state
  const [selectedImage, setSelectedImage] = useState(null);

  // Gender options
  const genderOptions = ["Male", "Female", "Other"];
  const [showGenderPicker, setShowGenderPicker] = useState(false);

  // state to manage DatePicker visibility
  const [showDOBPicker, setShowDOBPicker] = useState(false);

  // convert string to Date safely
  const parseDate = (dateStr) => {
    return dateStr ? new Date(dateStr) : new Date();
  };

  useEffect(() => {
    if (profile) {
      setUserData({
        first_name: profile.first_name || "",
        last_name: profile.last_name || "",
        username: profile.username || "",
        email: profile.email || "",
        gender: profile.gender || "",
        date_of_birth: profile.date_of_birth || "",
        bio: profile.bio || "",
        address: profile.address || "",
        address1: profile.address1 || "",
        mobile: profile.mobile || "",
      });
    }

    if (profile.country_flag && profile.country_code) {
      setCountryDetails({
        cca2: profile.country_flag,
        callingCode: [profile.country_code],
      });
    }
  }, [profile]);

  // Image picker function
  const pickImage = useCallback(async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "image/*",
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        return;
      }

      // Get the selected asset
      const asset = result.assets[0];

      // Set the image URI for display purposes
      setSelectedImage(asset.uri);

      // Store the image file object for API upload
      // This way the API service can create the proper FormData with a file
      setUserData((prev) => ({
        ...prev,
        profile_image: {
          uri: asset.uri,
          name: asset.name || `image.${asset.uri.split(".").pop()}`,
          type: asset.mimeType || `image/${asset.uri.split(".").pop()}`,
        },
      }));
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Error selecting image",
        text2: error.message,
      });
    }
  }, []);

  const handleChange = (field, value) => {
    setUserData((prev) => ({ ...prev, [field]: value }));
  };

  // Handle phone number input with validation
  const handlePhoneChange = (value) => {
    // Remove any non-digit characters
    const digits = value.replace(/\D/g, "");

    // Limit to 10 digits (13 with country code)
    const maxDigits = 10;
    const limitedDigits = digits.substring(0, maxDigits);

    setUserData((prev) => ({
      ...prev,
      mobile: limitedDigits,
    }));
  };

  // Mutation hooks for updating user profile only
  const userProfileMutation = useUpdateUserProfile();

  // Mutation hooks for signal provider profile
  const signalProviderMutation = useUpdateSignalProviderProfile();

  const handleSubmit = async () => {
    // Prepare data for submission
    const dataToSubmit = { ...userData };

    // Format phone number with country code
    if (countryDetails) {
      dataToSubmit.country_code = countryDetails.callingCode?.[0];
      dataToSubmit.country_flag = countryDetails.cca2;
    }

    // Remove empty passwords if not being changed
    if (
      !dataToSubmit.old_password &&
      !dataToSubmit.new_password &&
      !dataToSubmit.confirm_password
    ) {
      delete dataToSubmit.old_password;
      delete dataToSubmit.new_password;
      delete dataToSubmit.confirm_password;
    }

    // Validate password confirmation if changing password
    if (
      dataToSubmit.new_password &&
      dataToSubmit.new_password !== dataToSubmit.confirm_password
    ) {
      Toast.show({
        type: "error",
        text1: "Password Mismatch",
        text2: "New password and confirm password do not match",
      });
      return;
    }

    if (userType === "USER") {
      // For regular user profile update
      userProfileMutation.mutate(dataToSubmit, {
        onSuccess: () => {
          router.back();
        },
        onError: (error) => {
          Toast.show({
            type: "error",
            text1: "Update Failed",
            text2: error?.message || "An error occurred. Please try again.",
          });
        },
      });
    } else if (userType === "SIGNAL_PROVIDER") {
      // For signal provider profile update
      signalProviderMutation.mutate(dataToSubmit, {
        onSuccess: () => {
          Toast.show({
            type: "success",
            text1: "Profile Updated",
            text2: "Your profile has been updated successfully!",
          });
          router.back();
        },
        onError: (error) => {
          Toast.show({
            type: "error",
            text1: "Update Failed",
            text2: error?.message || "An error occurred. Please try again.",
          });
        },
      });
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
      keyboardVerticalOffset={insets.top}
      className="bg-[#E6F2FF]"
    >
      <View style={styles.profilecontainer}>
        <ProfileHeader
          backtxt={"Edit profile"}
          righttxt={"Save"}
          righticon={null}
          rightaction={handleSubmit}
          backaction={() => router.back()}
        />
        <ScrollView className={`w-full min-h-full`}>
          <View style={styles.main}>
            <View style={styles.profileimg} className="relative">
              <AppImage
                uri={selectedImage || profile.profile_image}
                contentFit="cover"
                placeholder={{ blurhash }}
                style={styles.image}
              />
              <View className="absolute bottom-0 bg-white/80 flex-row justify-center items-center gap-2 px-4 pb-1 w-28 rounded-full z-10">
                <Pressable onPress={pickImage}>
                  <MaterialIcons name="edit" size={27} color="#007AFF" />
                </Pressable>
                <Pressable
                  onPress={() => {
                    setSelectedImage(null);
                    setUserData((prev) => ({
                      ...prev,
                      profile_image: profile?.profile_image || null,
                    }));
                  }}
                >
                  <MaterialIcons name="delete" size={27} color="#fc0005" />
                </Pressable>
              </View>
            </View>

            <View style={styles.details}>
              <View style={styles.singlerow}>
                <View style={styles.label}>
                  <Text>First Name</Text>
                </View>
                <View style={styles.input}>
                  <TextInput
                    style={styles.inputfield}
                    placeholder="First Name"
                    keyboardType="default"
                    value={userData.first_name}
                    onChangeText={(text) => handleChange("first_name", text)}
                  />
                </View>
              </View>
              <View style={styles.singlerow}>
                <View style={styles.label}>
                  <Text>Last Name</Text>
                </View>
                <View style={styles.input}>
                  <TextInput
                    style={styles.inputfield}
                    placeholder="Last Name"
                    value={userData.last_name}
                    onChangeText={(text) => handleChange("last_name", text)}
                  />
                </View>
              </View>
              <View style={styles.singlerow}>
                <View style={styles.label}>
                  <Text>User Id</Text>
                </View>
                <View style={styles.input}>
                  <TextInput
                    style={styles.inputfield}
                    placeholder="User ID"
                    value={userData.username}
                    onChangeText={(text) => handleChange("username", text)}
                  />
                </View>
              </View>
              <View style={styles.singlerow}>
                <View style={styles.label}>
                  <Text>Phone No.</Text>
                </View>
                <View style={styles.input}>
                  <View style={styles.phoneContainer}>
                    {/* Country Code Picker */}
                    <Pressable style={styles.countryCode} onPress={() => {}}>
                      <CountryPicker
                        withFilter
                        withFlag
                        withCallingCode
                        withEmoji
                        onSelect={(country) => {
                          setCountryDetails(country);
                        }}
                        countryCode={countryDetails?.cca2 || "GB"}
                        containerButtonStyle={styles.countryPickerButton}
                      />
                      <Text style={styles.countryCodeText}>
                        +{countryDetails?.callingCode?.[0] || "44"}
                      </Text>
                      <MaterialIcons
                        name="arrow-drop-down"
                        size={18}
                        color="#333"
                      />
                    </Pressable>

                    {/* Phone Input */}
                    <TextInput
                      style={styles.phoneInput}
                      placeholder="Phone Number"
                      keyboardType="phone-pad"
                      value={userData.mobile}
                      onChangeText={handlePhoneChange}
                      maxLength={10} // Max 10 digits without country code
                    />
                  </View>
                </View>
              </View>
              <View style={styles.singlerow}>
                <View style={styles.label}>
                  <Text>Email ID</Text>
                </View>
                <View style={styles.input}>
                  <TextInput
                    style={styles.inputfield}
                    placeholder="Email"
                    value={userData.email}
                    onChangeText={(text) => handleChange("email", text)}
                  />
                </View>
              </View>
              <View style={styles.singlerow}>
                <View style={styles.label}>
                  <Text>Gender</Text>
                </View>
                <View style={styles.input}>
                  <Pressable
                    style={styles.genderDropdown}
                    onPress={() => setShowGenderPicker(true)}
                  >
                    <Text
                      style={{
                        color: userData.gender ? "#000" : "#aaa",
                        flex: 1,
                      }}
                    >
                      {userData.gender || "Select Gender"}
                    </Text>
                    <MaterialIcons
                      name="arrow-drop-down"
                      size={24}
                      color="#333"
                    />
                  </Pressable>

                  {/* Gender Selection Modal */}
                  <Modal
                    transparent={true}
                    visible={showGenderPicker}
                    animationType="fade"
                    onRequestClose={() => setShowGenderPicker(false)}
                  >
                    <Pressable
                      style={styles.modalOverlay}
                      onPress={() => setShowGenderPicker(false)}
                    >
                      <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Select Gender</Text>

                        {genderOptions.map((gender) => (
                          <Pressable
                            key={gender}
                            style={styles.genderOption}
                            onPress={() => {
                              handleChange("gender", gender);
                              setShowGenderPicker(false);
                            }}
                          >
                            <Text style={styles.genderOptionText}>
                              {gender}
                            </Text>
                            {userData.gender === gender && (
                              <AntDesign
                                name="check"
                                size={18}
                                color="#007AFF"
                              />
                            )}
                          </Pressable>
                        ))}

                        <Pressable
                          style={styles.cancelButton}
                          onPress={() => setShowGenderPicker(false)}
                        >
                          <Text style={styles.cancelButtonText}>Cancel</Text>
                        </Pressable>
                      </View>
                    </Pressable>
                  </Modal>
                </View>
              </View>

              {/* render DOB input */}
              <View style={styles.singlerow}>
                <View style={styles.label}>
                  <Text>Date of Birth</Text>
                </View>
                <View style={styles.input}>
                  <Pressable
                    onPress={() => setShowDOBPicker(true)}
                    style={[styles.inputfield, { justifyContent: "center" }]}
                  >
                    <Text
                      style={{
                        color: userData.date_of_birth ? "#000" : "#aaa",
                      }}
                    >
                      {userData.date_of_birth || "Select Date (YYYY-MM-DD)"}
                    </Text>
                  </Pressable>

                  {showDOBPicker && (
                    <DateTimePicker
                      value={parseDate(userData.date_of_birth)}
                      mode="date"
                      display={Platform.OS === "ios" ? "spinner" : "default"}
                      maximumDate={new Date()}
                      onChange={(event, selectedDate) => {
                        setShowDOBPicker(Platform.OS === "ios"); // keep open for iOS
                        if (selectedDate) {
                          // Format date as YYYY-MM-DD
                          const year = selectedDate.getFullYear();
                          const month = String(
                            selectedDate.getMonth() + 1
                          ).padStart(2, "0");
                          const day = String(selectedDate.getDate()).padStart(
                            2,
                            "0"
                          );
                          const formattedDate = `${year}-${month}-${day}`;

                          handleChange("date_of_birth", formattedDate);
                        }
                      }}
                    />
                  )}
                </View>
              </View>
              <View style={styles.singlerow}>
                <View style={styles.label}>
                  <Text>Bio</Text>
                </View>
                <View style={styles.input}>
                  <TextInput
                    style={styles.inputfield}
                    placeholder="Bio"
                    value={userData.bio}
                    onChangeText={(text) => handleChange("bio", text)}
                  />
                </View>
              </View>
              <View style={styles.singlerow}>
                <View style={styles.label}>
                  <Text>Address</Text>
                </View>
                <View style={styles.input}>
                  <TextInput
                    style={styles.inputfield}
                    placeholder="Address"
                    value={userData.address}
                    onChangeText={(text) => handleChange("address", text)}
                  />
                </View>
              </View>
              <View style={styles.singlerow}>
                <View style={styles.label}>
                  <Text>Address2</Text>
                </View>
                <View style={styles.input}>
                  <TextInput
                    style={styles.inputfield}
                    placeholder="Address2"
                    value={userData.address1}
                    onChangeText={(text) => handleChange("address1", text)}
                  />
                </View>
              </View>
              <View style={styles.singlerow}>
                <View style={styles.label}>
                  <Text>Change password</Text>
                </View>
                <View style={styles.input} className="gap-2">
                  <TextInput
                    style={styles.inputfield}
                    placeholder="Old Password"
                    keyboardType="default"
                    secureTextEntry={true}
                    value={userData.old_password}
                    onChangeText={(text) => handleChange("old_password", text)}
                  />
                  <TextInput
                    style={styles.inputfield}
                    placeholder="New Password"
                    keyboardType="default"
                    secureTextEntry={true}
                    value={userData.new_password}
                    onChangeText={(text) => handleChange("new_password", text)}
                  />
                  <TextInput
                    style={styles.inputfield}
                    placeholder="Confirm Password"
                    keyboardType="default"
                    secureTextEntry={true}
                    value={userData.confirm_password}
                    onChangeText={(text) =>
                      handleChange("confirm_password", text)
                    }
                  />
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  profilecontainer: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    backgroundColor: "#E6F2FF",
  },
  main: {
    width: "100%",
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "center",
    backgroundColor: "#E6F2FF",
    gap: 16,
    paddingVertical: 16,
    paddingHorizontal: 9,
    paddingBottom: 65, // Increased padding to avoid overlap with header
  },
  profileimg: {
    width: 120,
    height: 120,
    backgroundColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 60,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 60,
    overflow: "hidden",
  },
  details: {
    width: "100%",
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "center",
    gap: 20,
  },
  singlerow: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  label: {
    width: "35%",
    justifyContent: "flex-start",
    alignItems: "flex-start",
    paddingHorizontal: 12,
  },
  input: {
    width: "65%",
    justifyContent: "flex-start",
    alignItems: "center",
    paddingHorizontal: 12,
  },
  inputfield: {
    width: "100%",
    backgroundColor: "#F3F3F3",
    height: 36,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 8,
    fontSize: 16,
  },
  // Phone input styles
  phoneContainer: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  countryCode: {
    width: "37%",
    backgroundColor: "#F3F3F3",
    height: 36,
    borderRadius: 8,
    marginRight: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  countryPickerButton: {
    alignItems: "center",
    justifyContent: "center",
  },
  countryCodeText: {
    fontSize: 14,
    // marginHorizontal: 2,
    marginLeft: -8,
  },
  phoneInput: {
    flex: 1,
    backgroundColor: "#F3F3F3",
    height: 36,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 8,
    fontSize: 16,
  },
  // Gender dropdown styles
  genderDropdown: {
    width: "100%",
    backgroundColor: "#F3F3F3",
    height: 36,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  genderOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  genderOptionText: {
    fontSize: 16,
  },
  cancelButton: {
    marginTop: 16,
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    color: "#007AFF",
    fontWeight: "500",
  },
});
