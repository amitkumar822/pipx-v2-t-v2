import React, { useEffect, useState, useCallback, useRef } from "react";
import { getMultiple } from "./storage";
import { onlineManager } from "@tanstack/react-query";
import * as Network from "expo-network";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { STORAGE_KEYS } from "../config/environment";
import { monitorTokenExpiry } from "./TokenManager";
import { AuthEvents } from "../services/ApiInterceptor";


const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (renamed from cacheTime in v5)
    },
  },
});

interface AuthContextType {
  isLoggedIn: boolean;
  setIsLoggedIn: (value: boolean) => void;
  userType: string;
  setUserType: (value: string) => void;
  isLoading: boolean;
  logout: () => Promise<void>;
}

export const AuthContext = React.createContext<AuthContextType>(
  {} as AuthContextType
);

export function AuthContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userType, setUserType] = useState("USER");
  const [isLoading, setIsLoading] = useState(true);
  const tokenExpiryCleanupRef = useRef<(() => void) | null>(null);

  // Setup network listener with proper error handling
  useEffect(() => {
    onlineManager.setEventListener((setOnline) => {
      const checkConnection = async () => {
        try {
          const status = await Network.getNetworkStateAsync();
          setOnline(!!status.isConnected);
        } catch (error) {
          console.error("Network check error:", error);
        }
      };

      // initial check
      checkConnection();

      // poll every 10s
      const interval = setInterval(checkConnection, 10000);
      return () => clearInterval(interval);
    });
  }, []);


  const logout = useCallback(async () => {
    try {
      // Clear token expiry monitor
      if (tokenExpiryCleanupRef.current) {
        tokenExpiryCleanupRef.current();
        tokenExpiryCleanupRef.current = null;
      }
      
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.AUTH_TOKEN,
        STORAGE_KEYS.USER_TYPE,
        STORAGE_KEYS.REFRESH_TOKEN, // Also clear refresh token if using it
      ]);
      
      // Update state
      setIsLoggedIn(false);
      setUserType("USER");
      
      console.log("Logout successful - cleared auth state");
    } catch (error) {
      console.error("Error during logout:", error);
    }
  }, []);

  // Listen for token expiry from API calls
  useEffect(() => {
    // Register listener for token expiry events
    const unsubscribe = AuthEvents.onTokenExpired(() => {
      console.log("🔐 Auth Context: Token expired event received");
      logout();
    });
    
    // Cleanup listener on unmount
    return () => {
      unsubscribe();
    };
  }, [logout]);

  // Effect for auth initialization
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setIsLoading(true);

        const timeoutPromise = new Promise<null>((resolve) =>
          setTimeout(() => {
            resolve(null); // return null instead of throwing
          }, 15000)
        );

        const storagePromise = await getMultiple([
          STORAGE_KEYS.AUTH_TOKEN,
          STORAGE_KEYS.USER_TYPE,
        ]);

        const values = await Promise.race([storagePromise, timeoutPromise]);

        if (values && Array.isArray(values)) {
          const [authToken, type] = values.map(item => item?.[1] || "");
          if (authToken) {
            setIsLoggedIn(true);
            setUserType(type || "USER");
            
            // Setup token expiry monitoring
            if (tokenExpiryCleanupRef.current) {
              tokenExpiryCleanupRef.current(); // Clear any existing timers
            }
            tokenExpiryCleanupRef.current = monitorTokenExpiry(authToken, logout);
          }
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
        setIsLoggedIn(false);
        setUserType("USER");
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
    
    // Cleanup function for component unmount
    return () => {
      if (tokenExpiryCleanupRef.current) {
        tokenExpiryCleanupRef.current();
        tokenExpiryCleanupRef.current = null;
      }
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        setIsLoggedIn,
        userType,
        setUserType,
        isLoading,
        logout,
      }}
    >
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </AuthContext.Provider>
  );
}
