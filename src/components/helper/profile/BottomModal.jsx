import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Modal from "react-native-modal";

export const BottomModal = ({ isOpened, setIsOpened }) => {
  return (
    <Modal isVisible={isOpened}>
      <View style={styles.modalcontainer}>
        <View style={styles.main}>
          <View style={styles.msgbox}>
            <Text style={styles.subjecttxt}>
              Do you want to unblock Harsh Wardhan (@mr_harsh_Wardhan)?
            </Text>
          </View>
          <Pressable
            style={styles.actionbox}
            onPress={(e) => setIsOpened(!isOpened)}
          >
            <Text style={styles.actiontxt}>Unfollow</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalcontainer: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  main: {
    width: "100%",
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "center",
    gap: 8,
  },
  msgbox: {
    width: "100%",
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 16,
  },
  subjecttxt: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: "500",
    color: "#1E1E1E",
    textAlign: "center",
  },
  actionbox: {
    width: "100%",
    borderRadius: 16,
    borderColor: "#007AFF",
    borderWidth: 1,
    backgroundColor: "#E6F2FF",
  },
  actiontxt: {
    color: "#007AFF",
    textAlign: "center",
    paddingVertical: 12,
  },
});
