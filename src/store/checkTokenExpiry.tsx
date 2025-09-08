import { jwtDecode } from "jwt-decode";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { STORAGE_KEYS } from "@/src/config/environment";

// Non-hook utility function to clear storage on token expiry
const clearAuthStorage = async () => {
  try {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.AUTH_TOKEN,
      STORAGE_KEYS.USER_TYPE,
      STORAGE_KEYS.REFRESH_TOKEN,
    ]);
    console.log("Token expired - Auth storage cleared");
    return true;
  } catch (error) {
    console.error("Error clearing auth storage:", error);
    return false;
  }
};

// This is a plain function, not a hook
export const CheckTokenExpiry = (token: string, logoutCallback?: () => void) => {
  try {
    const decoded: { exp?: number } = jwtDecode(token);

    if (decoded?.exp) {
      const expiryTime = decoded.exp * 1000; // convert to ms
      const currentTime = Date.now();

      if (currentTime >= expiryTime) {
        // Token already expired -> logout immediately
        clearAuthStorage().then(() => {
          if (logoutCallback) logoutCallback();
        });
        return;
      }

      // Schedule auto logout at expiry
      const timeout = expiryTime - currentTime;
      console.log(`Token will expire in ${Math.floor(timeout / 60000)} minutes`);
      
      setTimeout(() => {
        console.log("Token expired - Logging out automatically");
        clearAuthStorage().then(() => {
          if (logoutCallback) logoutCallback();
        });
      }, timeout);
    }
  } catch (error) {
    console.error("Invalid token, logging out:", error);
    clearAuthStorage().then(() => {
      if (logoutCallback) logoutCallback();
    });
  }
};
