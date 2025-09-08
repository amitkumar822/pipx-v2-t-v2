import { jwtDecode } from "jwt-decode";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { STORAGE_KEYS } from "@/src/config/environment";

interface JwtToken {
  exp?: number;
  // Add other token fields if needed
}

// Utility to check if token is expired
export const isTokenExpired = (token: string): boolean => {
  try {
    const decoded: JwtToken = jwtDecode(token);
    if (!decoded.exp) return true;
    
    const currentTime = Date.now();
    const expiryTime = decoded.exp * 1000; // Convert to milliseconds
    
    return currentTime >= expiryTime;
  } catch (error) {
    return true; // If we can't decode, assume expired
  }
};

// Utility to get expiry time from token
export const getTokenExpiryTime = (token: string): number | null => {
  try {
    const decoded: JwtToken = jwtDecode(token);
    return decoded.exp ? decoded.exp * 1000 : null;
  } catch (error) {
    console.error("Error getting token expiry time:", error);
    return null;
  }
};

// Clear auth storage
export const clearAuthStorage = async (): Promise<boolean> => {
  try {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.AUTH_TOKEN,
      STORAGE_KEYS.USER_TYPE,
      STORAGE_KEYS.REFRESH_TOKEN,
    ]);
    return true;
  } catch (error) {
    return false;
  }
};

// Setup token expiry monitoring and auto-logout
export const setupTokenExpiryMonitor = (
  token: string,
  logoutCallback: () => void,
): (() => void) => {
  let timeoutId: NodeJS.Timeout | null = null;

  try {
    const expiryTime = getTokenExpiryTime(token);
    
    if (!expiryTime) {
      // Invalid token, logout immediately
      clearAuthStorage().then(logoutCallback);
      return () => {};
    }
    
    const currentTime = Date.now();
    
    if (currentTime >= expiryTime) {
      // Token already expired, logout immediately
      clearAuthStorage().then(logoutCallback);
      return () => {};
    }
    
    // Schedule logout before token expires
    // Logout 60 seconds before actual expiry to be safe
    const timeToExpiry = Math.max(0, expiryTime - currentTime - 60000);
    
    // @ts-ignore - setTimeout returns different types in Node vs browser/RN
    timeoutId = setTimeout(() => {
      clearAuthStorage().then(logoutCallback);
    }, timeToExpiry);
    
    // Return cleanup function
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  } catch (error) {
    clearAuthStorage().then(logoutCallback);
    return () => {};
  }
};

// Function to handle token expiry monitoring for use in components
export const monitorTokenExpiry = (token: string, logoutCallback: () => void) => {
  const cleanup = setupTokenExpiryMonitor(token, logoutCallback);
  // Return cleanup function to be used in useEffect
  return cleanup;
};
