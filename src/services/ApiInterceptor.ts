import AsyncStorage from "@react-native-async-storage/async-storage";
import { STORAGE_KEYS } from "@/src/config/environment";
import { jwtDecode } from "jwt-decode";

// Utility to check if token is expired - duplicate from TokenManager to avoid circular dependencies
export const isTokenExpired = (token: string): boolean => {
  try {
    const decoded: { exp?: number } = jwtDecode(token);
    if (!decoded.exp) return true;
    
    const currentTime = Date.now();
    const expiryTime = decoded.exp * 1000; // Convert to milliseconds
    
    return currentTime >= expiryTime;
  } catch (error) {
    return true; // If we can't decode, assume expired
  }
};

// This is a global flag to prevent multiple logout events
let isLoggingOut = false;

// Create an event system for auth events
export const AuthEvents = {
  // List of listeners for token expiry
  expiredTokenListeners: [] as ((expired: boolean) => void)[],
  
  // Add listener
  onTokenExpired: (callback: (expired: boolean) => void) => {
    AuthEvents.expiredTokenListeners.push(callback);
    return () => {
      const index = AuthEvents.expiredTokenListeners.indexOf(callback);
      if (index > -1) {
        AuthEvents.expiredTokenListeners.splice(index, 1);
      }
    };
  },
  
  // Trigger listeners when token expires
  notifyTokenExpired: () => {
    // Prevent multiple simultaneous logout processes
    if (isLoggingOut) return;
    isLoggingOut = true;
    
    // Notify all listeners
    AuthEvents.expiredTokenListeners.forEach(listener => {
      try {
        listener(true);
      } catch (error) {
        console.error("Error in token expired listener:", error);
      }
    });
  }
};

/**
 * Checks if the token is expired before making an API call
 * If token is expired, triggers the logout process
 */
export const checkTokenBeforeApiCall = async (): Promise<boolean> => {
  try {
    // Get the token from AsyncStorage
    const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    
    // If no token, allow the call (login/register paths)
    if (!token) return true;
    
    // Check if token is expired
    const expired = isTokenExpired(token);
    
    // If token is expired, trigger logout
    if (expired) {
      console.log("🔑 Token expired during API call - logging out");
      AuthEvents.notifyTokenExpired();
      return false; // Don't proceed with API call
    }
    
    // Token is valid, proceed with API call
    return true;
  } catch (error) {
    console.error("Error checking token before API call:", error);
    // If there's an error checking the token, assume it's valid
    // to prevent blocking API calls unnecessarily
    return true;
  }
};
