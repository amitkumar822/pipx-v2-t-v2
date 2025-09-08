import React from "react";
import {
  Pressable,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
} from "react-native";

const Buttons = ({ onPress, title = "Continue", isLoading = false }) => {
  return (
    <View style={{width: "100%"}}>
      <Pressable
        style={[styles.button, isLoading && styles.disabledButton]}
        onPress={onPress}
        disabled={isLoading}
      >
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator
              size="small"
              color="#FFF"
              style={{ marginRight: 8 }}
            />
            <Text style={styles.buttonText}>Please wait...</Text>
          </View>
        ) : (
          <Text style={styles.buttonText}>{title}</Text>
        )}
      </Pressable>
    </View>
  );
};

export default Buttons;

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#007AFF",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 16,
  },
  disabledButton: {
    backgroundColor: "#A7A7A7",
  },
  buttonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
});
