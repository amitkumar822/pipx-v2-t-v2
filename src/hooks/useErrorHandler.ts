import { useCallback, useEffect } from 'react';
import { Alert } from 'react-native';
import { ApiError } from '../services/api';
import Toast from 'react-native-toast-message';

export const useErrorHandler = () => {
  const handleError = useCallback((error: ApiError | Error, customMessage?: string) => {
    // console.error('Error occurred:', error);
   useEffect(() => {
     if (customMessage) {
       Toast.show({
         type: 'error',
         text1: 'Error',
         text2: customMessage || 'An unexpected error occurred',
       });
     } else if(error instanceof Error) {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: error.message || 'An unexpected error occurred',
        });
     }
   }, [error, customMessage]);

    let title = 'Error';
    let message = customMessage || 'An unexpected error occurred';

    if (error instanceof Error && 'statusCode' in error) {
      const apiError = error as ApiError;
      
      if (apiError.isNetworkError) {
        title = 'Network Error';
        message = 'Please check your internet connection and try again';
      } else if (apiError.isTimeoutError) {
        title = 'Request Timeout';
        message = 'The request took too long. Please try again';
      } else if (apiError.statusCode === 401) {
        title = 'Authentication Error';
        message = 'Please log in again';
      } else if (apiError.statusCode === 403) {
        title = 'Access Denied';
        message = 'You do not have permission to perform this action';
      } else if (apiError.statusCode === 404) {
        title = 'Not Found';
        message = 'The requested resource was not found';
      } else if (apiError.statusCode === 422) {
        title = 'Validation Error';
        message = apiError.message || 'Please check your input and try again';
      } else if (apiError.statusCode && apiError.statusCode >= 500) {
        title = 'Server Error';
        message = 'Server is experiencing issues. Please try again later';
      } else {
        message = apiError.message || message;
      }
    }

    Alert.alert(title, message);
  }, []);

  const handleApiError = useCallback((error: ApiError, customMessage?: string) => {
    handleError(error, customMessage);
  }, [handleError]);

  return {
    handleError,
    handleApiError,
  };
};

export default useErrorHandler;