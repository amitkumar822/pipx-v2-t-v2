import { useCallback, useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { BottomSheetWrapper } from "../helper/shared/BottomSheetWrapper";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { LoginComponent } from "../helper/auth/LoginComponent";
import { SignUpComponent } from "../helper/auth/SignUpComponent";

export const LoginScreen = () => {
  const [bottomSheetModalRef, setBottomSheetModalRef] = useState(null);
  const [activateSheet, setActivateSheet] = useState(false);
  const [isSignUp, setIsSignUp] = useState(true);

  const handlePresentModalPress = useCallback((from) => {
    if (from === "login") {
      setIsSignUp(false);
    } else {
      setIsSignUp(true);
    }
    setActivateSheet(true);
  }, []);

  useEffect(() => {
    if (
      activateSheet &&
      Boolean(bottomSheetModalRef) &&
      Boolean(bottomSheetModalRef.current)
    ) {
      bottomSheetModalRef?.current?.expand();
    }
  }, [activateSheet, bottomSheetModalRef]);

  return (
    <>
      <GestureHandlerRootView style={styles.ghcontainer}>
        <View style={styles.conatiner}>
          <View style={styles.topsection}>
            <Text style={styles.text}>PipX Login</Text>
          </View>
          <View style={styles.bottomsection}>
            <View style={styles.titletxt}>
              <Text style={styles.headtxt} >Welcome to Pip</Text>
              <Text style={styles.bodytxt}>
                To sign up, you need to be at least 18. Your birthday won’t be
                shared with other users.
              </Text>
            </View>
            <View style={styles.authinput}>
              <Pressable
                style={styles.login}
                onPress={() => handlePresentModalPress("login")}
              >
                <Text style={styles.logintxt}>Login</Text>
              </Pressable>
              <Pressable
                style={styles.signup}
                onPress={() => handlePresentModalPress("signup")}
              >
                <Text style={styles.signuptxt}>Signup</Text>
              </Pressable>
            </View>
          </View>
        </View>
        <BottomSheetWrapper
          setBottomSheetModalRef={setBottomSheetModalRef}
          activateSheet={activateSheet}
          setActivateSheet={setActivateSheet}
        >
          {isSignUp ? <SignUpComponent /> : <LoginComponent />}
        </BottomSheetWrapper>
      </GestureHandlerRootView>
    </>
  );
};

const styles = StyleSheet.create({
  ghcontainer: {
    flex: 1,
  },
  conatiner: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
  },
  text: {
    fontSize: 20,
    color: "#000",
  },
  topsection: {
    width: "100%",
    height: "60%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F3F3F3",
  },
  bottomsection: {
    width: "100%",
    height: "40%",
    flexDirection: "column",
    gap: 65,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  titletxt: {
    width: "80%",
    justifyContent: "center",
    alignItems: "center",
    gap: "6px",
  },
  headtxt: {
    color: "#1A1C29",
    fontFamily: "Poppins",
    fontSize: 24,
    fontStyle: "normal",
    fontWeight: "700",
  },
  bodytxt: {
    color: "#1A1C29",
    fontFamily: "Poppins",
    fontSize: 16,
    fontStyle: "normal",
    fontWeight: "400",
    textAlign: "center",
  },
  authinput: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  login: {
    width: "40%",
    backgroundColor: "#FFFFFF",
    paddingVertical: 16,
    borderRadius: 14,
    borderRadius: 14,
    marginTop: 20,
    borderColor: "#007AFF",
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  logintxt: {
    color: "#007AFF",
    fontSize: 16,
    fontWeight: "600",
  },
  signup: {
    width: "40%",
    backgroundColor: "#007AFF",
    paddingVertical: 16,
    borderRadius: 14,
    marginTop: 20,
    borderColor: "#007AFF",
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  signuptxt: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
