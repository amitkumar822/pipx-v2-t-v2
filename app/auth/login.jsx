import { LoginScreen } from "@/src/components/screens/LoginScreen";
import { AppStatusBar } from "@/src/components/utils/AppStatusBar";
import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Login() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <AppStatusBar backgroundColor="#FFF" barStyle="dark-content" />
      <LoginScreen />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({});
