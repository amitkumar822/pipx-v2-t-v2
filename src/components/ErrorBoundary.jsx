import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { router } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to console or error reporting service
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Check specifically for view tag errors
    const isViewTagError = 
      error?.message?.includes('viewState for tag') || 
      error?.message?.includes('view with tag');
      
    // Update state with error details
    this.setState({
      error: error,
      errorInfo: errorInfo,
      isViewTagError
    });
    
    // Call onError callback if provided
    if (typeof this.props.onError === 'function') {
      try {
        this.props.onError(error, errorInfo);
      } catch (callbackError) {
        console.error('Error in onError callback:', callbackError);
      }
    }
  }

  handleRestart = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    // Navigate to home screen
    try {
      router.replace('/');
    } catch (navigationError) {
      console.error('Error navigating to root:', navigationError);
      // Fallback to reloading the app
      try {
        router.replace('/(tabs)');
      } catch (fallbackError) {
        console.error('Error navigating to tabs:', fallbackError);
      }
    }
  };

  handleGoHome = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    try {
      router.replace('/(tabs)/home');
    } catch (navigationError) {
      console.error('Error navigating to home:', navigationError);
      // Fallback to reloading the app
      try {
        router.replace('/');
      } catch (fallbackError) {
        console.error('Error navigating to root:', fallbackError);
      }
    }
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        if (typeof this.props.fallback === 'function') {
          return this.props.fallback({
            error: this.state.error,
            errorInfo: this.state.errorInfo,
            reset: this.handleRestart
          });
        }
        return this.props.fallback;
      }
      
      // Default fallback UI
      return (
        <View style={styles.container}>
          <View style={styles.errorContainer}>
            <MaterialIcons name="error-outline" size={64} color="#FF3B30" />
            
            <Text style={styles.title}>Oops! Something went wrong</Text>
            
            <Text style={styles.message}>
              The app encountered an unexpected error. This might be due to:
            </Text>
            
            <View style={styles.reasonsList}>
              <Text style={styles.reason}>• Network connection issues</Text>
              <Text style={styles.reason}>• Server maintenance</Text>
              <Text style={styles.reason}>• Session expired</Text>
              <Text style={styles.reason}>• App needs to be updated</Text>
            </View>
            
            <View style={styles.buttonContainer}>
              <Pressable style={styles.primaryButton} onPress={this.handleRestart}>
                <Text style={styles.primaryButtonText}>Try Again</Text>
              </Pressable>
              
              <Pressable style={styles.secondaryButton} onPress={this.handleGoHome}>
                <Text style={styles.secondaryButtonText}>Go to Home</Text>
              </Pressable>
            </View>
            
            {__DEV__ && this.state.error && (
              <View style={styles.debugContainer}>
                <Text style={styles.debugTitle}>Debug Info (Dev Mode):</Text>
                <Text style={styles.debugText}>
                  {this.state.error.toString()}
                </Text>
                {this.state.errorInfo && (
                  <Text style={styles.debugText}>
                    {this.state.errorInfo.componentStack}
                  </Text>
                )}
              </View>
            )}
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

// Network Error Handler Component
export const NetworkErrorHandler = ({ error, onRetry, onGoHome }) => {
  const isNetworkError = error?.message?.includes('Network') || 
                        error?.message?.includes('fetch') ||
                        error?.code === 'NETWORK_ERROR';
  
  const isAuthError = error?.status === 401 || 
                     error?.message?.includes('Unauthorized') ||
                     error?.message?.includes('token');

  return (
    <View style={styles.container}>
      <View style={styles.errorContainer}>
        <MaterialIcons 
          name={isNetworkError ? "wifi-off" : isAuthError ? "lock-outline" : "error-outline"} 
          size={64} 
          color="#FF3B30" 
        />
        
        <Text style={styles.title}>
          {isNetworkError ? "Connection Problem" : 
           isAuthError ? "Session Expired" : 
           "Something went wrong"}
        </Text>
        
        <Text style={styles.message}>
          {isNetworkError ? 
            "Please check your internet connection and try again." :
           isAuthError ? 
            "Your session has expired. Please log in again." :
            "An unexpected error occurred. Please try again."}
        </Text>
        
        <View style={styles.buttonContainer}>
          <Pressable style={styles.primaryButton} onPress={onRetry}>
            <Text style={styles.primaryButtonText}>
              {isAuthError ? "Log In Again" : "Try Again"}
            </Text>
          </Pressable>
          
          {onGoHome && (
            <Pressable style={styles.secondaryButton} onPress={onGoHome}>
              <Text style={styles.secondaryButtonText}>Go to Home</Text>
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorContainer: {
    alignItems: 'center',
    maxWidth: 400,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E1E1E',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 12,
  },
  message: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 20,
  },
  reasonsList: {
    alignSelf: 'stretch',
    marginBottom: 30,
  },
  reason: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
    paddingLeft: 10,
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  secondaryButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  debugContainer: {
    marginTop: 30,
    padding: 15,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    alignSelf: 'stretch',
  },
  debugTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  debugText: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'monospace',
    lineHeight: 16,
  },
});

export default ErrorBoundary;